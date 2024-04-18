import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatDialogRef} from "@angular/material/dialog";
import {MatIconModule} from "@angular/material/icon";
import {IceInputComponent} from "../../../share-component/ice-input/ice-input.component";
import {IDataSource, IVariablesMap} from "../../../../workers/workerModel";
import {FormsModule} from "@angular/forms";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {environment} from "../../../../../environments/environment";
import {IceComponentType, REQUEST_TEST_ERROR} from "../../../../constants";
import {DataSourceMap, DataSourceService} from "../../../../services/data-source.service";
import {SpinnerService} from "../../../../services/spinner.service";
import {IceDataSource} from "../../../../workers/IceDataSource";
import {MatTabsModule} from "@angular/material/tabs";
import {ComponentMaket, IceDocumentMaket} from "../../../../interfaces/interfaces";
import {NgxJsonViewerModule} from "ngx-json-viewer";
import {MatTooltipModule} from "@angular/material/tooltip";
import {ComponentFilterPipe} from "../../../../pipe/component-filter.pipe";
import {Subject} from "rxjs";

@Component({
  selector: 'app-data-source-properties',
  standalone: true,
  imports: [CommonModule, MatIconModule, IceInputComponent, FormsModule, MatSlideToggleModule, MatTabsModule, NgxJsonViewerModule, MatTooltipModule, ComponentFilterPipe],
  templateUrl: './data-source-properties.component.html',
  //styles: ['.fix >>> .ngx-json-viewer { overflow: auto !important; }'],
  styles: ['::ng-deep .ngx-json-viewer {overflow: auto !important;}'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataSourcePropertiesComponent implements OnInit, OnDestroy {
  currentDataSource: IDataSource
  currentTemplate: IceDocumentMaket
  localDataSource: IDataSource
  private _isNativeSource: boolean = true;
  nativeString = ""
  bffUrl = environment.bffURI + '/operation'
  protected urlIsValid: boolean = false;
  responseDataMap: DataSourceMap[] = [];

  responseJsonData: any

  selectedTabIndex: number = 0;
  showComponentRelationDialog = false;
  isSelectComponentType: 'path' | 'body'
  editVariable: IVariablesMap = {key: "", value: "", isAutoFill: true}
  currentTemplateComponentList: ComponentMaket[]
  localErrorText = ""
  searchText: string;
  tempComponentName: string;
  isDynamicVarDialog = false
  isDynamicVarReady$ = new Subject<boolean>()

  constructor(public dialogRef: MatDialogRef<DataSourcePropertiesComponent>,
              private dataSourceService: DataSourceService,
              private changeDetection: ChangeDetectorRef,
              private spinnerService: SpinnerService) {
  }

  ngOnDestroy(): void {
        if(this.isDynamicVarReady$)
          this.isDynamicVarReady$.unsubscribe()
    }

  ngOnInit(): void {
    this.initComponentList()
    this.localDataSource = {...this.currentDataSource}
    this.isDynamicVarReady$.subscribe(value => {
      if(value) {
        this.getData()
      }
    })
  }

  get isNativeSource(): boolean {
    return this._isNativeSource;
  }

  set isNativeSource(value: boolean) {
    this.localDataSource.isNativeSource = value
    this.nativeString = value ? "Получение данных из нативного источника (запрос будет по адресу:" : "Получение данных из стороннего источника"
    if (value) {
      /**Если запрос на наш бэк*/
      this.localDataSource.method = this.currentDataSource.isNativeSource ? this.currentDataSource.method : "GET"
      this.localDataSource.url = this.currentDataSource.isNativeSource ? this.currentDataSource.url : environment.resourceServerURL
    } else {
      /**На сторонний*/
      this.localDataSource.method = !this.currentDataSource.isNativeSource ? this.currentDataSource.method : "GET"
      this.localDataSource.url = !this.currentDataSource.isNativeSource ? this.currentDataSource.url : "https://"
    }
    this._isNativeSource = value;
  }

  testConnection() {
    if (!this.localDataSource.method || !this.urlIsValid) return
    /**Нужно проверить если в запросе есть динамические поля то нужно их подставить*/
    this.setDynamicFields()
  }

  getData(){
    this.spinnerService.show()
    this.dataSourceService.getDataForTest(IceDataSource.builder(this.localDataSource)).subscribe({
      next: (res => {
        this.responseJsonData = res
        //this.responseDataMap = [...res]
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
      this.isDynamicVarReady$.next(!this.isDynamicVarDialog)

  }

  SaveAndClose() {
    this.dialogRef.close(1)
  }

  selectTab() {
    let wrapper = document.getElementsByClassName('mat-mdc-tab-body-wrapper')
    if (wrapper) {
      wrapper[0].setAttribute("style", "height:100%")
    }
  }

  setAutoFillComponent(pv: number, type: 'path' | 'body') {
    this.showComponentRelationDialog = true
    this.isSelectComponentType = type
    if (this.isSelectComponentType === 'path')
      this.editVariable = this.localDataSource.pathVariables[pv]
    if (this.isSelectComponentType === 'body')
      this.editVariable = this.localDataSource.bodyVariables[pv]
    this.initComponentList()
  }

  initComponentList() {
    if (this.isSelectComponentType)
      this.currentTemplateComponentList = this.currentTemplateComponentList
        .filter(value => value.componentType === IceComponentType.INPUT)
    else
      this.currentTemplateComponentList = this.currentTemplate.docStep.map(value => value.componentMaket.flat()).flat()
  }

  addRowPathValue() {
    if (!this.localDataSource.pathVariables)
      this.localDataSource.pathVariables = []
    this.localDataSource.pathVariables.push({key: "", value: "", isAutoFill: true})
  }

  removeRowPathValue() {
    if (this.localDataSource.pathVariables)
      this.localDataSource.pathVariables.splice(this.localDataSource.pathVariables.length - 1, 1)
  }

  clearTablePathValue() {
    if (this.localDataSource.pathVariables)
      this.localDataSource.pathVariables.splice(0, this.localDataSource.pathVariables.length)
  }

  addRowBodyValue() {
    if (!this.localDataSource.bodyVariables)
      this.localDataSource.bodyVariables = []
    this.localDataSource.bodyVariables.push({key: "", value: "", isAutoFill: true})
  }

  removeRowBodyValue() {
    if (this.localDataSource.bodyVariables)
      this.localDataSource.bodyVariables.splice(this.localDataSource.bodyVariables.length - 1, 1)
  }

  clearTableBodyValue() {
    if (this.localDataSource.bodyVariables)
      this.localDataSource.bodyVariables.splice(0, this.localDataSource.bodyVariables.length)
  }

  select($event: Event) {
  }

  SaveAndCloseRelation() {
    this.showComponentRelationDialog = false
    if (this.isSelectComponentType) {
      this.editVariable.value = "[" + this.tempComponentName + "]"
      return
    }
  }

  changeComponentForRelation(component: ComponentMaket) {

  }

  setDynamicVar() {
    this.isDynamicVarDialog = false
    if(this.localDataSource.dynamicPathVariables.length > 0 && this.localDataSource.dynamicPathVariables.find(item => item.value.length === 0))
      return
    this.isDynamicVarReady$.next(true)
  }
}
