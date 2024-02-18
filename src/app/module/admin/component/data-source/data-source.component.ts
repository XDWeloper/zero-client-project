import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from "@angular/material/icon";
import {IceDataSourceWorker } from "../../../../workers/IceDataSourceWorker";
import {IceInputComponent} from "../../../share-component/ice-input/ice-input.component";
import {FormsModule} from "@angular/forms";
import {DataSourceMap, DataSourceService} from "../../../../services/data-source.service";
import {ComponentMaket, IceDocumentMaket} from "../../../../interfaces/interfaces";
import {DocumentService} from "../../../../services/document.service";
import {ComponentFilterPipe} from "../../../../pipe/component-filter.pipe";
import {DataSourceFilterPipe} from "../../../../pipe/dataSource-filter.pipe";
import {ERROR, IceComponentType, REQUEST_TEST_ERROR} from "../../../../constants";
import {ComponentService} from "../../../../services/component.service";
import {NgxMaskDirective} from "ngx-mask";
import {MatTabsModule} from "@angular/material/tabs";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MessageService} from "../../../../services/message.service";
import {environment} from "../../../../../environments/environment";
import {SpinnerService} from "../../../../services/spinner.service";
import {IDataSource, IVariablesMap, IWorker} from "../../../../workers/workerModel";

@Component({
  selector: 'app-data-source',
  standalone: true,
  imports: [CommonModule, MatIconModule, IceInputComponent, FormsModule, ComponentFilterPipe, DataSourceFilterPipe, NgxMaskDirective, MatTabsModule, MatTooltipModule, MatCheckboxModule, MatSlideToggleModule],
  templateUrl: './data-source.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataSourceComponent implements OnInit {
  dataSourceChanges: IceDataSourceWorker;
  relationChanges: { sourcePath: string, receiverComponentName: string }[] = []
  dataSource: IDataSource;
  responseDataMap: DataSourceMap[] = [];
  protected isSelectComponentType: 'path' | 'body'
  bffUrl = environment.bffURI + '/operation'
  nativeString = ""

  @Input("worker")
  set DataSource(value: IWorker) {
    let newValue = value as IDataSource
    this.dataSource = newValue
    this.dataSourceChanges = new IceDataSourceWorker(newValue.id,newValue.name,"NETDATASOURCE",newValue.url,newValue.method,newValue.pathVariables,newValue.bodyVariables,newValue.relation,newValue.event, newValue.isNativeSource)
    if (newValue.relation) {
      this.relationChanges = [...newValue.relation]
    }
    this.isNativeSource = newValue.isNativeSource
  }

  @Input('currentTemplate') currentTemplate: IceDocumentMaket
  @Output('currentWorker') currentWorker = new EventEmitter<IWorker>()
  dataSourceMenuOpen: boolean = false;
  dataSourceMenuPosition: any;
  private _showDatSourceProp = false;
  showComponentRelationDialog = false;
  currentResponseData: DataSourceMap
  currentTemplateComponentList: ComponentMaket[]
  tempComponentName: string
  searchText: string;
  sourceSearchText: string;
  onClear: boolean = false;
  showChangeTableColumNumDialog: boolean = false;
  tableColumnArray: number[] = []
  selectedColumnNum: number = -1;
  private _selectedTabIndex: number = 0;
  protected urlIsValid: boolean = false;

  editVariable: IVariablesMap = {key:"",value:"",isAutoFill: true}
  private _isNativeSource: boolean = true;
  currentDoc: IceDocumentMaket

  constructor(
    private dataSourceService: DataSourceService,
    private documentService: DocumentService,
    private componentService: ComponentService,
    private changeDetection: ChangeDetectorRef,
    private messageService: MessageService,
    private spinnerService: SpinnerService) {
  }


  get isNativeSource(): boolean {
    return this._isNativeSource;
  }

  set isNativeSource(value: boolean) {

    this.dataSourceChanges.isNativeSource = value
    this.nativeString = value ? "Получение данных из нативного источника (запрос будет по адресу:" : "Получение данных из стороннего источника"

    if(value){ /**Если запрос на наш бэк*/
      this.dataSourceChanges.method = this.dataSource.isNativeSource ? this.dataSource.method : "GET"
      this.dataSourceChanges.url = this.dataSource.isNativeSource ? this.dataSource.url : environment.resourceServerURL

    } else {/**На сторонний*/
      this.dataSourceChanges.method = !this.dataSource.isNativeSource ? this.dataSource.method : "GET"
      this.dataSourceChanges.url = !this.dataSource.isNativeSource ? this.dataSource.url : "https://"
    }

    this._isNativeSource = value;
  }

  get selectedTabIndex(): number {
    return this._selectedTabIndex;
  }

  set selectedTabIndex(value: number) {
    this._selectedTabIndex = value;
  }

  get showDatSourceProp(): boolean {
    return this._showDatSourceProp;
  }

  set showDatSourceProp(value: boolean) {
    this._showDatSourceProp = value;
    if (value === true) {
      this.relationChanges.forEach(value1 => this.responseDataMap.push({
        key: value1.sourcePath,
        componentName: value1.receiverComponentName
      }))
    } else {
    }
  }

  ngOnInit() {
    this.initComponentList()
    if(this.currentTemplate)
      this.currentDoc = this.documentService.getTemplateByDocId(this.currentTemplate.docId)
  }

  revertMenu() {
    this.dataSourceMenuOpen = !this.dataSourceMenuOpen
  }

  rightClick($event: MouseEvent) {
    $event.preventDefault();
    this.dataSourceMenuPosition = {x: $event.x, y: $event.y}
    this.revertMenu()
  }

  editDataSource() {
    this._showDatSourceProp = true
    this.revertMenu()
  }

  removeDataSource() {
    let index = this.currentTemplate.docAttrib.workerList.findIndex((value  => value === this.dataSource))
    if (index != undefined)
      this.currentTemplate.docAttrib.workerList.splice(index, 1)
    this.revertMenu()
    this.currentWorker.next(undefined)
    this.componentService.setModified(true)

  }

  SaveAndClose() {
    //let templ = this.documentService.getTemplateByDocId(this.currentTemplate.docId)
    let tamplDataSourceIndex = this.currentDoc.docAttrib.workerList.findIndex(value => value === this.dataSource)
    this.currentDoc.docAttrib.workerList.splice(tamplDataSourceIndex, 1)

    if(this.dataSourceChanges.relation)
      this.dataSourceChanges.relation.splice(0,this.dataSourceChanges.relation.length)
    this.dataSourceChanges.relation = [...this.relationChanges]
    this.dataSource = {...this.dataSourceChanges as IDataSource}
    this.currentWorker.next(undefined)
    this.currentDoc.docAttrib.workerList.push(this.dataSource)
    this._showDatSourceProp = false

    this.componentService.setModified(true)
  }

  testConnection() {
    if (!this.dataSourceChanges.method || !this.urlIsValid) return
    this.spinnerService.show()
    this.dataSourceService.getData(this.dataSourceChanges).subscribe({
      next  : (res  => {
        this.responseDataMap = [...res]
        this.rewriteOldRelation()
        this.spinnerService.hide()
        this.changeDetection.detectChanges()
      }),
      error : (error =>  {
        this.messageService.show(REQUEST_TEST_ERROR, error.message, ERROR)
        this.spinnerService.hide()
        this.SaveAndClose()
      }),
  })

  }

  rewriteOldRelation(){
    this.relationChanges.forEach(value => {
      this.responseDataMap.filter(value1 => value1.key === value.sourcePath).forEach(value1 => {
        value1.componentName = value.receiverComponentName
      })
      // let data = this.responseDataMap.find(value1 => value1.key === value.sourcePath)
      // if(data)
      //   data.componentName = value.receiverComponentName
    })
  }

  openComponentRelationDialog(data: DataSourceMap) {
    this.initComponentList()
    if(this.onClear) {
      this.onClear = false
      return
    }
    this.showComponentRelationDialog = true
    this.currentResponseData = data
    this.tempComponentName = data.componentName
  }

  changeComponentForRelation(component: ComponentMaket) {
    this.tempComponentName = component.componentName

    if(this.isSelectComponentType) {
      return
    }

    if(component.componentType === IceComponentType.TABLE){/**Нужно определить номер колонки*/
      this.selectedColumnNum ++
      this.tableColumnArray = new Array(component.tableProp.header.map(v => v.subHeader).flat().length).fill(0).map((_,i) => i + 1)
      this.showChangeTableColumNumDialog= true
    }else {
      this.setComponentNameForRelation();
    }
    /**заэнэблить компонент*/
    this.documentService.getTemplateByDocId(this.currentTemplate.docId).docStep
      .map(i => i.componentMaket)
      .flat()
      .find(i => i.componentID === 1).enabled = false


    let currentComponent = this.componentService.componentCollection
                              .map(item => item.instance)
                              .find(item =>item.componentID == component.componentID)

    if(currentComponent)
      currentComponent.enabled = false

  }


  private setComponentNameForRelation() {
    let relationData = this.relationChanges.find(value => value.sourcePath === this.currentResponseData.key)
    if (relationData != undefined)
      relationData.receiverComponentName = this.tempComponentName
    else
      this.relationChanges.push({
        sourcePath: this.currentResponseData.key,
        receiverComponentName: this.tempComponentName
      })
  }

  SaveAndCloseRelation() {
    this.showComponentRelationDialog = false
    if(this.isSelectComponentType) {
      this.editVariable.value = "[" + this.tempComponentName + "]"
      return
    }

    this.currentResponseData.componentName = this.tempComponentName
  }

  columnSelected() {
    this.showChangeTableColumNumDialog = false
    this.tempComponentName += `.${this.selectedColumnNum}`
    this.setComponentNameForRelation();
  }

  addRowPathValue() {
    if(!this.dataSourceChanges.pathVariables)
      this.dataSourceChanges.pathVariables = []
    this.dataSourceChanges.pathVariables.push({key:"",value:"",isAutoFill: true})
  }

  removeRowPathValue() {
    if(this.dataSourceChanges.pathVariables)
      this.dataSourceChanges.pathVariables.splice(this.dataSourceChanges.pathVariables.length - 1,1)
  }

  clearTablePathValue() {
    if(this.dataSourceChanges.pathVariables)
      this.dataSourceChanges.pathVariables.splice(0,this.dataSourceChanges.pathVariables.length)
  }

  selectTab() {
    let wrapper = document.getElementsByClassName('mat-mdc-tab-body-wrapper')
    if(wrapper) {
      wrapper[0].setAttribute("style","height:100%")
    }
    this.isSelectComponentType = undefined
  }

  addRowBodyValue() {
    if(!this.dataSourceChanges.bodyVariables)
      this.dataSourceChanges.bodyVariables = []
    this.dataSourceChanges.bodyVariables.push({key:"",value:"",isAutoFill: true})
  }

  removeRowBodyValue() {
    if(this.dataSourceChanges.bodyVariables)
      this.dataSourceChanges.bodyVariables.splice(this.dataSourceChanges.bodyVariables.length - 1,1)
  }

  clearTableBodyValue() {
    if(this.dataSourceChanges.bodyVariables)
      this.dataSourceChanges.bodyVariables.splice(0,this.dataSourceChanges.bodyVariables.length)
  }

  setAutoFillComponent(pv: number, type: 'path' | 'body') {
    this.showComponentRelationDialog= true
    this.isSelectComponentType = type
    if(this.isSelectComponentType === 'path')
      this.editVariable = this.dataSourceChanges.pathVariables[pv]
    if(this.isSelectComponentType === 'body')
      this.editVariable = this.dataSourceChanges.bodyVariables[pv]

    this.initComponentList()

  }

  initComponentList(){
    if(this.isSelectComponentType)
      this.currentTemplateComponentList = this.currentTemplateComponentList
        .filter(value => value.componentType === IceComponentType.INPUT)
    else
      this.currentTemplateComponentList = this.currentTemplate.docStep.map(value => value.componentMaket.flat()).flat()

  }

  removeRelation(index: number) {
      this.relationChanges.splice(index,1)
  }
}
