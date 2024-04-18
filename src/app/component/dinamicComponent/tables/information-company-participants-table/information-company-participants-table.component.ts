import { Component } from '@angular/core';
import {CellService} from "../../../../services/cell.service";
import {
  ComponentBound, ComponentInputType, ComponentRuleForPDF,
  IceComponent,
  IceEvent,
  MasterControl, OptionList,
  TableProperties,
  TextPosition
} from "../../../../interfaces/interfaces";
import {IceComponentType} from "../../../../constants";
import {ComponentService} from "../../../../services/component.service";

interface TableRow {
  field1: string | undefined
  field2: string | undefined
  field3: string | undefined
  field4: string | undefined
  field5: string | undefined
}

@Component({
  selector: 'app-information-company-participants-table',
  templateUrl: './information-company-participants-table.component.html'
})
//Сведения об участниках общества, размерах их долей в уставном капитале и их оплате
export class InformationCompanyParticipantsTableComponent implements IceComponent {

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
    optionList?: OptionList[] | undefined
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
      field5: undefined,
    })
  }
  setValue(){
    this.value = this.tableData
    if(this.componentID)
      this.componentService.setComponentValue({componentId: this.componentID, value: this.value})

  }

  removeRow() {
    this.setValue()
    this.tableData.splice(this.tableData.length - 1, 1)
  }

  clearTable() {
    this.setValue()
    this.tableData.splice(0,this.tableData.length)
  }

}
