import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from "@angular/material/icon";
import {IceDataSource} from "../../../../model/IceDataSource";
import {IceInputComponent} from "../../../share-component/ice-input/ice-input.component";
import {FormsModule} from "@angular/forms";
import {DataSourceMap, DataSourceService} from "../../../../services/data-source.service";
import {ComponentMaket, IceDocumentMaket} from "../../../../interfaces/interfaces";
import {DocumentService} from "../../../../services/document.service";
import {ComponentFilterPipe} from "../../../../pipe/component-filter.pipe";
import {DataSourceFilterPipe} from "../../../../pipe/dataSource-filter.pipe";
import {IceComponentType} from "../../../../constants";

@Component({
  selector: 'app-data-source',
  standalone: true,
  imports: [CommonModule, MatIconModule, IceInputComponent, FormsModule, ComponentFilterPipe, DataSourceFilterPipe],
  templateUrl: './data-source.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataSourceComponent implements OnInit {
  dataSourceChanges: IceDataSource;
  relationChanges: { sourcePath: string, receiverComponentName: string }[] = []
  dataSource: IceDataSource;
  responseDataMap: DataSourceMap[] = [];

  @Input('dataSource')
  set DataSource(value: IceDataSource) {
    this.dataSource = value
    this.dataSourceChanges = {...value}
    if (value.relation) {
      this.relationChanges = [...value.relation]
    }
  }

  @Input('currentTemplate') currentTemplate: IceDocumentMaket
  @Output('currentDataSource') currentDataSource = new EventEmitter<IceDataSource>()
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


  constructor(private dataSourceService: DataSourceService, private documentService: DocumentService) {
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
    this.currentTemplateComponentList = this.currentTemplate.docStep.map(value => value.componentMaket.flat()).flat()
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
    let index = this.currentTemplate.dataSource.findIndex(value => value == this.dataSource)
    if (index != undefined)
      this.currentTemplate.dataSource.splice(index, 1)
    this.revertMenu()
    this.currentDataSource.next(undefined)
  }

  SaveAndClose() {
    let templ = this.documentService.getTemplateByDocId(this.currentTemplate.docId)
    let tamplDataSourceIndex = templ.dataSource.findIndex(value => value === this.dataSource)
    templ.dataSource.splice(tamplDataSourceIndex, 1)

    this.dataSourceChanges.relation = [...this.relationChanges]
    this.dataSource = {...this.dataSourceChanges}
    this.currentDataSource.next(undefined)
    templ.dataSource.push(this.dataSource)
    this._showDatSourceProp = false
  }

  testConnection() {
    if (!this.dataSourceChanges.url) return
    this.responseDataMap = [...this.dataSourceService.getData("")]

    this.relationChanges.forEach(value => {
      let data = this.responseDataMap.find(value1 => value1.key === value.sourcePath)
      if(data)
        data.componentName = value.receiverComponentName
    })
  }

  openComponentRelationDialog(data: DataSourceMap) {
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

    if(component.componentType === IceComponentType.TABLE){/**Нужно определить номер солонки*/
      this.selectedColumnNum ++
      this.tableColumnArray = new Array(component.tableProp.header.map(v => v.subHeader).flat().length).fill(0).map((_,i) => i + 1)
      this.showChangeTableColumNumDialog= true
    }else {
      this.setComponentNameForRelation();
    }
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
    this.currentResponseData.componentName = this.tempComponentName
  }

  columnSelected() {
    this.showChangeTableColumNumDialog = false
    this.tempComponentName += `.${this.selectedColumnNum}`
    this.setComponentNameForRelation();
  }
}
