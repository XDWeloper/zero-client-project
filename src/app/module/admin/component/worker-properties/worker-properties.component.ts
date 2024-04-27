import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import {ComponentMaket, IceDocumentMaket, IceStepMaket} from "../../../../interfaces/interfaces";
import {
  Action,
  ActionGroup,
  ActionObjectType, ConditionType,
  IAction,
  IActionGroup,
  IDataSource,
  IWorker
} from "../../../../workers/workerModel";
import {IceInputComponent} from "../../../share-component/ice-input/ice-input.component";
import {MatIconModule} from "@angular/material/icon";
import {KeyValuePipe, NgClass, NgForOf, NgIf, NgStyle, NgTemplateOutlet} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatDialogRef} from "@angular/material/dialog";
import {DataSourceMap, DataSourceService} from "../../../../services/data-source.service";
import {SpinnerService} from "../../../../services/spinner.service";
import {MatTabsModule} from "@angular/material/tabs";
import {NgxJsonViewerModule} from "ngx-json-viewer";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatTooltipModule} from "@angular/material/tooltip";
import {ComponentFilterPipe} from "../../../../pipe/component-filter.pipe";
import {
  functionNameAndDescription,
  IceComponentType,
  ObjectEditedFields,
  ObjectField,
  REQUEST_TEST_ERROR
} from "../../../../constants";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {IceDataSource} from "../../../../workers/IceDataSource";
import {DataSourceFilterPipe} from "../../../../pipe/dataSource-filter.pipe";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MaketComponent} from "../maketComponent/maket.component";
import {ConditionComponentPipe} from "../../../../pipe/condition-component.pipe";

@Component({
  selector: 'app-worker-properties',
  templateUrl: './worker-properties.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IceInputComponent,
    MatIconModule,
    NgIf,
    ReactiveFormsModule,
    FormsModule,
    NgForOf,
    MatTabsModule,
    NgxJsonViewerModule,
    MatExpansionModule,
    MatTooltipModule,
    NgTemplateOutlet,
    NgClass,
    ComponentFilterPipe,
    NgStyle,
    MatSlideToggleModule,
    KeyValuePipe,
    DataSourceFilterPipe,
    MatCheckboxModule,
    ConditionComponentPipe,
  ],
  standalone: true,
  styles:['select {' +
  '  -webkit-appearance: none;' +
  '  -moz-appearance: none;' +
  '  text-indent: 1px;' +
  '  text-overflow: auto' +
  '}']
})
export class WorkerPropertiesComponent implements OnInit, AfterViewInit{
  currentTemplate: IceDocumentMaket
  currentWorker: IWorker;
  localWorker: IWorker;
  localDataSource: IDataSource
  searchText: any;
  currentActionGroup: IActionGroup
  changeActionObjectDialogOpen = false
  setAutoFillFromSourceDialogOpen = false
  setRezultObjectDialogOpen = false
  private _selectedObjectType: ActionObjectType | undefined
  selectedPage: IceStepMaket;
  selectedComponent: ComponentMaket;
  selectedComponentForCondition: {comp: ComponentMaket, compProp: string}
  dataSourceDataMap: DataSourceMap[] = [];
  selectedRowObjectDataSourceDataMap: DataSourceMap[] = [];
  height = 0
  localErrorText: any;
  selectedDataSourceDataMapRow: DataSourceMap
  fieldSetCurrentText: string = "";
  currentObjectFieldData: { fieldName: string, fieldSet: {object: string, string: any}, isAutoFill: boolean }
  componentPropForCond: {comp: ComponentMaket, compProp: string}[] = []
  currentSelectedConditionArgument: number | undefined = undefined
  currentAction: Action = undefined
  currentObject: IceDocumentMaket | IceStepMaket | ComponentMaket | undefined = undefined
  protected readonly IceComponentType = IceComponentType;
  selectedSubHeader: number;
  tableComponentAutoFillValue: string[] = []
  currentCondition:ConditionType

  @ViewChild('accordionContainer')
  accordionContainer : ElementRef;
  isDynamicVarDialog: boolean;
  isSelectComponentForCondition = false
  isSetFunctionForCondition= false
  functionNameAndDescription = functionNameAndDescription
  currentDescription: string;
  selectedFunction: string = ""

  constructor(public dialogRef: MatDialogRef<WorkerPropertiesComponent>,
              private dataSourceService: DataSourceService,
              private changeDetection: ChangeDetectorRef,
              private spinnerService: SpinnerService) {
  }

  ngAfterViewInit(): void {
    }

  ngOnInit(): void {
    this.localWorker = {...this.currentWorker}
    this.currentActionGroup = !this.localWorker.actionGroupList ? undefined : this.localWorker.actionGroupList[0] ?? undefined
    if(this.currentActionGroup && !this.currentActionGroup.conditions){
      this.currentActionGroup.conditions = [{preRelation: undefined,argument1: "",relation: "=", argument2:""}]
    }
  }

  SaveAndClose() {
    this.dialogRef.close(1)
  }


  add() {
    if(!this.localWorker.actionGroupList)
      this.localWorker.actionGroupList = []
    let newActionGroup = new ActionGroup("Набор " + this.localWorker.actionGroupList.length)
    newActionGroup.conditions = [{preRelation: undefined,argument1: "",relation: "=", argument2:""}]
    this.localWorker.actionGroupList.push(newActionGroup)
  }

  remove() {
    if(!this.currentActionGroup) return
    let index = this.localWorker.actionGroupList.findIndex(value => value === this.currentActionGroup)
    if(index != -1) {
      this.localWorker.actionGroupList.splice(index, 1)
      if(this.localWorker.actionGroupList.length > 0 && index != 0)
        this.currentActionGroup = this.localWorker.actionGroupList[index - 1]
      else
        this.currentActionGroup = undefined
    }
  }

  getSelectedIndex(): number {
    if(!this.localWorker.actionGroupList || this.localWorker.actionGroupList.length < 1) return undefined
    let index = this.localWorker.actionGroupList.findIndex(value => value === this.currentActionGroup)
    if(index != -1) {
      return this.localWorker.actionGroupList.findIndex(value => value === this.currentActionGroup)
    }
    else {
      this.currentActionGroup = this.localWorker.actionGroupList[0]
      return 0
    }
  }

  addAction() {
    this.changeActionObjectDialogOpen = true
  }

  removeAction(action: IAction) {
    this.currentActionGroup.action.splice(this.currentActionGroup.action.findIndex(item => item.objectId === action.objectId), 1)
  }

  ChangeActionObjectDialogSaveAndClose() {
    if(!this.currentActionGroup.action)
      this.currentActionGroup.action = []

    let newAction : Action

    if(this._selectedObjectType === "DOCUMENT") {
      newAction = this.getNewAction(this.currentTemplate)
      this.setObjectFieldList(newAction,this.currentTemplate)
    }
    if(this._selectedObjectType === "PAGE") {
      newAction = this.getNewAction(this.selectedPage)
      this.setObjectFieldList(newAction,this.selectedPage)
    }
    if(this._selectedObjectType === "COMPONENT") {
      newAction = this.getNewAction(this.selectedComponent)
      this.setObjectFieldList(newAction,this.selectedComponent)
    }

    this.currentActionGroup.action.push(newAction)
    this.selectedObjectType = undefined
    this.changeActionObjectDialogOpen = false
  }

  getNewAction(object: IceDocumentMaket | IceStepMaket | ComponentMaket): Action{
    //let newAction: Action = {objectType: "DOCUMENT",objectName: "",objectId: 0}
    let newAction: Action = new Action()
    switch (this.selectedObjectType){
      case "DOCUMENT":
        newAction.objectName = this.currentTemplate.docName
        newAction.objectId = this.currentTemplate.docId
        newAction.objectType = "DOCUMENT"
        break
      case "PAGE":
        newAction.objectName = (object as IceStepMaket).stepName
        newAction.objectId = (object as IceStepMaket).stepNum
        newAction.objectType = "PAGE"
        break
      case "COMPONENT":
        newAction.objectName = (object as ComponentMaket).componentName
        newAction.objectId = (object as ComponentMaket).componentID
        newAction.objectType = "COMPONENT"
        break

    }
    return newAction
  }


  get selectedObjectType(): ActionObjectType | undefined {
    return this._selectedObjectType;
  }

  set selectedObjectType(value: ActionObjectType | undefined) {
    this._selectedObjectType = value;
    if(value === 'DOCUMENT')
      this.ChangeActionObjectDialogSaveAndClose()
  }

  getAllComponent(): ComponentMaket[] {
    return this.currentTemplate.docStep.map(item => item.componentMaket).flat()
  }

  getAllComponentForCondition(): ComponentMaket[] {
    return this.currentTemplate.docStep.map(item => item.componentMaket)
      .flat()
      .filter(item =>
        item.componentType === IceComponentType.INPUT
        || item.componentType === IceComponentType.SELECT
        || item.componentType === IceComponentType.PLACE
        || item.componentType === IceComponentType.AREA)
  }

  setObjectFieldList(action: IAction,object: IceDocumentMaket | IceStepMaket | ComponentMaket) {
    let componentType: IceComponentType = undefined

    if(action.objectType === "COMPONENT")
    componentType = this.currentTemplate.docStep.map(item => item.componentMaket).flat()
      .find(item => item.componentID === action.objectId).componentType

    action.componentFieldActionList = ObjectEditedFields.filter(item =>
        item.objectType === action.objectType
          && ((componentType && item.componentType.includes(componentType) || !componentType))
    ).map(item =>{
      let fieldVal = null
      let keyIndex = Object.keys(object).findIndex(key => key === item.fieldName)
      if(keyIndex != -1){
        fieldVal = Object.values(object)[keyIndex]
      }
      return {fieldName : item.fieldName,fieldSet: fieldVal, isAutoFill: false,isDisabledAfterFill:false}
    }


  )

  }

  selectTab() {
    let wrapper = document.getElementsByClassName('mat-mdc-tab-body-wrapper')
    if (wrapper) {
      wrapper[0].setAttribute("style", "height:100%")
    }
    if(this.height === 0)
      this.height = this.accordionContainer.nativeElement.clientHeight
  }

  getVisualPropForActionList(action: IAction, fieldName: string): ObjectField{
    let component = this.getComponentById(action.objectId)
    let result = {...ObjectEditedFields.find(item => item.fieldName === fieldName && item.objectType === action.objectType)}

    if(component && action.objectType === 'COMPONENT' && component.componentType === IceComponentType.INPUT && component.inputType === 'checkbox' && fieldName === 'value') {
      result.fieldType = 'boolean'
    }

    return result
  }


  setAutoFillFromSourceDialog(field: { fieldName: string, fieldSet: {object: string, string: any}, isAutoFill: boolean }) {
    if(!field.fieldSet){
      field.fieldSet =  {object: "", string: ""}
    }
    this.currentObjectFieldData = field

    this.setAutoFillFromSourceDialogOpen = true
  }

  getDataMap() {
    this.localDataSource = this.currentTemplate.docAttrib.dataSourceList.find(item => item.id === this.localWorker.dataSourceId)
    if(!this.localDataSource){
      this.localErrorText = "Источник данных не найден"
      return
    }
    this.setDynamicFields()
  }

  setDynamicFields() {

    if (this.localDataSource.pathVariables) {
      if(this.localDataSource.dynamicPathVariables)
        this.localDataSource.dynamicPathVariables.splice(0,this.localDataSource.dynamicPathVariables.length)
      this.localDataSource.dynamicPathVariables = this.localDataSource.pathVariables
        .filter(item => item.isAutoFill && item.value && item.key && item.value.startsWith("[") && item.value.endsWith("]"))
        .map(item =>  {
          return {...item, value: ""}
        })
    }
    if (this.localDataSource.bodyVariables) {
      if(this.localDataSource.dynamicBodyVariables)
        this.localDataSource.dynamicBodyVariables.splice(0,this.localDataSource.bodyVariables.length)
      this.localDataSource.dynamicBodyVariables = this.localDataSource.bodyVariables
        .filter(item => item.isAutoFill && item.value && item.key && item.value.startsWith("[") && item.value.endsWith("]"))
        .map(item =>  {
          return {...item, value: ""}
        })
    }

    this.isDynamicVarDialog = this.localDataSource.dynamicPathVariables && this.localDataSource.dynamicPathVariables.length > 0
    if(!this.isDynamicVarDialog)
      this.setDynamicVar()

  }

  setDynamicVar() {
    this.spinnerService.show()
    this.dataSourceService.getDataMapValue(IceDataSource.builder(this.localDataSource)).subscribe({
      next: (res => {
        this.dataSourceDataMap = [...res]
        this.spinnerService.hide()
        this.changeDetection.detectChanges()
      }),
      error: (error => {
        this.localErrorText = REQUEST_TEST_ERROR + `  (${error.message})`
        this.spinnerService.hide()
        this.changeDetection.detectChanges()
      }),
    })
  }

  getValue(value: any) {
    if(value === null)
      return "null"
    return typeof value === 'object' ? Object.keys(value) : value
  }

  selectDataSourceDataMapRow(row: DataSourceMap) {
    this.selectedDataSourceDataMapRow = row
    if((typeof row.value) === 'object'){
      this.dataSourceService.parseJsonObject(row.value).subscribe(value => {
        this.selectedRowObjectDataSourceDataMap = value
      })
    } else {
      this.selectedRowObjectDataSourceDataMap = [row]
    }
    this.setRezultObjectDialogOpen = true
    this.createArrayForTable()
    this.selectedSubHeader = 0
  }

  setRezultObjectValue() {
    this.setRezultObjectDialogOpen = false
  }

  setFieldSetPropFromObject(row: DataSourceMap) {
    if(this.tableComponentAutoFillValue.length > 0 && this.selectedSubHeader != undefined){
      this.tableComponentAutoFillValue[this.selectedSubHeader] = row.key
      if(this.selectedSubHeader < this.tableComponentAutoFillValue.length - 1)
        this.selectedSubHeader++
      else
        this.selectedSubHeader = undefined
    } else {
      this.fieldSetCurrentText += `[${row.key}]`
    }
  }

  clearRezultObjectValue() {
    /**Обнулить всё*/
    this.fieldSetCurrentText = ""
    this.selectedDataSourceDataMapRow = undefined
    this.tableComponentAutoFillValue = []
  }

  setRezultObjectField() {
    console.log("this.fieldSetCurrentText", this.fieldSetCurrentText)
    this.currentObjectFieldData.fieldSet.object = this.selectedDataSourceDataMapRow.key
    if(this.fieldSetCurrentText.length === 0 && this.tableComponentAutoFillValue.length > 0)
      this.currentObjectFieldData.fieldSet.string = [...this.tableComponentAutoFillValue]
    else
      this.currentObjectFieldData.fieldSet.string = this.fieldSetCurrentText
    this.clearRezultObjectValue()
  }

  setAutoFillFromSourceDialogAndShow(field: {
    fieldName: string;
    fieldSet: { object: string; string: string };
    isAutoFill: boolean
  }) {
    this.fieldSetCurrentText = field.fieldSet.string
    this.selectedRowObjectDataSourceDataMap = [{key:field.fieldSet.object}]
    this.setAutoFillFromSourceDialogOpen = true
    this.setRezultObjectDialogOpen = true
  }

  selectComponentForCondition(cond: ConditionType, argumentNumber: number) {
    this.currentCondition = cond
    this.currentSelectedConditionArgument = argumentNumber
    this.componentPropForCond.splice(0,this.componentPropForCond.length)
    this.componentPropForCond.push(...this.getAllComponentForCondition().map(item => {return {comp: item, compProp: "value"}}))
    this.isSelectComponentForCondition = true
  }

  setComponentForCondition() {
    // console.log("selectedComponentForCondition : ",this.selectedComponentForCondition)
    // console.log("currentActionGroup : ",this.currentActionGroup)
    // console.log("currentSelectedConditionArgument : ",this.currentSelectedConditionArgument)

    let argValue = "[" + this.selectedComponentForCondition.comp.componentName + "." + this.selectedComponentForCondition.compProp + "]"

//    console.log("argValue : ",argValue)

    if(this.currentSelectedConditionArgument === 1)
      this.currentCondition.argument1 = argValue
    else
      this.currentCondition.argument2 = argValue

    this.selectedComponentForCondition = undefined
    this.isSelectComponentForCondition = false
  }

  clearCondition(i: number) {
    this.currentActionGroup.conditions.splice(i,1)
  }

  setCurrentObject(){
    switch (this.currentAction.objectType){
      case "COMPONENT":
        //this.currentObject = this.currentTemplate.docStep.map(item => item.componentMaket).flat().find(item => item.componentID === this.currentAction.objectId)
        this.currentObject = this.getComponentById(this.currentAction.objectId)
        break
      case "PAGE":
        this.currentObject = this.currentTemplate.docStep[this.currentAction.objectId]
        break
      case "DOCUMENT":
        this.currentObject = this.currentTemplate
    }

  }

  createArrayForTable(){
    if(this.currentAction.objectType === 'COMPONENT' && (this.currentObject as ComponentMaket).componentType === IceComponentType.TABLE){
      let headColumnNum = (this.currentObject as ComponentMaket).tableProp.header.map(item => item.subHeader).flat().length
      console.log("headColumnNum", headColumnNum)
      this.tableComponentAutoFillValue = new Array(headColumnNum)
    }
  }

  getCurrentComponent(): MaketComponent {
    return this.currentObject as MaketComponent
  }

  getComponentById(id: number): ComponentMaket{
    return this.currentTemplate.docStep.map(item => item.componentMaket).flat().find(item => item.componentID === id)
  }

  addCondition() {
    let preRel: "&&" | "||" = "&&"
    if(this.currentActionGroup.conditions && this.currentActionGroup.conditions.length === 0)
      preRel = undefined
    this.currentActionGroup.conditions.push({preRelation: preRel,argument1: "",relation: "=", argument2:""})
  }

  setFunctionForCondition() {
    if(this.currentSelectedConditionArgument === 1)
      this.currentCondition.argument1 = this.setFunc(this.currentCondition.argument1)
    else
      this.currentCondition.argument2 = this.setFunc(this.currentCondition.argument2)

    this.currentDescription = ""
    this.selectedFunction = ""

  }

  setFunc(arg: string): string{
    switch (this.selectedFunction){
      case "substring": return arg + ".substring(0,1)"
      case "length": return arg + ".length()"
    }
    return arg
  }

  selectFunctionForCondition(condition: ConditionType, arg: number) {
    this.currentCondition = condition
    this.currentSelectedConditionArgument = arg
    this.isSetFunctionForCondition = true
  }
}


