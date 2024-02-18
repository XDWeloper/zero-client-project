import { Component } from '@angular/core';
import { IceComponentType } from 'src/app/constants';
import {CellService} from "../../../../services/cell.service";
import {
  ComponentBound, ComponentInputType, ComponentRuleForPDF,
  IceComponent,
  IceEvent,
  MasterControl,
  TableProperties,
  TextPosition
} from "../../../../interfaces/interfaces";
import {ComponentService} from "../../../../services/component.service";

interface TableRow {
  field1: number | undefined
  field2: number | undefined
  field3: number | undefined
  field4: number | undefined
}


@Component({
  selector: 'app-information-main-counterparties-table',
  templateUrl: './information-main-counterparties-table.component.html'
})
//Сведения об основных контрагентах, планируемых плательщиках и получателях денежных средств
export class InformationMainCounterpartiesTableComponent implements IceComponent {
  masterControlList: MasterControl[];

  cellNumber: number;
  componentBound: ComponentBound;
  componentID: number;
  componentName: string;
  componentType: IceComponentType;
  correctX: number;
  correctY: number;
  inputType: ComponentInputType;
  placeHolder: string;
  required: boolean;
  stepNum: number;
  textPosition: TextPosition;
  value: any;
  frameColor: string;
  maxLength: number | undefined;
  maxVal: number | undefined;
  minLength: number | undefined;
  minVal: number | undefined;
  regExp: string | undefined;
  notification: string | undefined;

  height: any;
  width: any;
  top: any;
  left: any;

  tableData: TableRow[] = new Array()
  enabled = true
  visible = true


  constructor(private cellService: CellService, private componentService: ComponentService) {
  }

  tableProp?: TableProperties;
    componentEvent?: IceEvent[];
    update(): void {
        throw new Error('Method not implemented.');
    }

  tableType: number;

  checkedText?: string;
    optionList?: string[];
    printRule: ComponentRuleForPDF;


  ngOnInit(): void {
    this.height = this.cellService.getClientCellHeight() * this.componentBound.heightScale
    this.width =  this.cellService.getClientCellWidth() * this.componentBound.widthScale
    this.left =   this.cellService.getClientCellBound(this.cellNumber).x - this.correctX
    this.top =    this.cellService.getClientCellBound(this.cellNumber).y - this.correctY

    if(this.value != undefined)
      this.tableData = this.value
  }

  addRow() {
    this.tableData.push({
      field1: undefined,
      field2: undefined,
      field3: undefined,
      field4: undefined,
    })
  }

  setValue(){
    this.value = this.tableData
    if(this.componentID)
      this.componentService.setComponentValue({componentId: this.componentID, value: this.value})

  }

  removeRow() {
    this.tableData.splice(this.tableData.length - 1, 1)
    this.setValue()
  }

  clearTable() {
    this.tableData.splice(0,this.tableData.length)
    this.setValue()
  }
}
