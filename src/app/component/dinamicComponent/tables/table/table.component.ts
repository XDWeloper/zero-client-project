import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from "@angular/material/icon";
import {
  ComponentBound,
  ComponentInputType,
  ComponentRuleForPDF,
  ControlPropType,
  Header,
  IceComponent,
  MasterControl, OptionList,
  SubHeader,
  TableProperties,
  TextPosition
} from "../../../../interfaces/interfaces";
import {AlertColor, IceComponentType} from "../../../../constants";
import {CellService} from "../../../../services/cell.service";
import {ComponentService} from "../../../../services/component.service";
import {from, max, Subscription} from "rxjs";
import {MatTooltipModule} from "@angular/material/tooltip";
import {DomSanitizer} from "@angular/platform-browser";
import {NgxMaskDirective} from "ngx-mask";
import {map} from "rxjs/operators";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, NgxMaskDirective, FormsModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent implements IceComponent, AfterViewInit{

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
  tableProp?: TableProperties
  localBorderColor: string
  height: any;
  width: any;
  top: any;
  left: any;
  tableData: any[][] = []
  enabled = true
  visible = true
  private changeValue$: Subscription
  tableType: number;
  checkedText?: string;
  optionList?: OptionList[] | undefined
  printRule: ComponentRuleForPDF;
  headerMaxHeight: number | undefined = undefined
  subHeaderMaxHeight: number | undefined = undefined
  columnNum = 0



  constructor(private cellService: CellService, private componentService: ComponentService,public sanitizer: DomSanitizer, private changeDetector: ChangeDetectorRef) {
  }

  ngAfterViewInit(): void {
      // После отрисовки необходимо скорректировать высоту заголовков
    this.setHeaderHeight()
    if(this.tableProp)
      this.columnNum = this.tableProp.header.map(value => value.subHeader.length).reduce((previousValue, currentValue) => previousValue + currentValue)
    }

  setHeaderHeight(){
    let headList = document.querySelectorAll(".headClass")
    let subHeadList = document.querySelectorAll(".subHeadClass")
    from(headList).pipe(
      map(value => value.clientHeight),
      max()
    ).subscribe(value => {
      this.headerMaxHeight = value
    })

    from(subHeadList).pipe(
      map(value => value.clientHeight),
      max()
    ).subscribe(value => {
      this.subHeaderMaxHeight = value
    })
    this.changeDetector.detectChanges()
  }
  ngOnInit(): void {
    this.height = this.cellService.getClientCellHeight() * this.componentBound.heightScale
    this.width =  this.cellService.getClientCellWidth() * this.componentBound.widthScale
    this.left =   this.cellService.getClientCellBound(this.cellNumber).x - this.correctX
    this.top =    this.cellService.getClientCellBound(this.cellNumber).y - this.correctY

    if(this.value != undefined)
      this.tableData = this.value

    this.propControl()

  }

  private propControl() {
    this.changeValue$ = this.componentService.changeValue$.subscribe(item => {
      let componentId = item.componentId
      let value = item.value


      if(componentId === this.componentID && value === "NaN") {
        if(item.checkedText && item.checkedText.length > 0)
          this.localBorderColor = AlertColor
        this.checkedText = item.checkedText
      }

      if (componentId === this.componentID || value === undefined) return

      if (this.masterControlList) {
        let list = this.masterControlList.filter(c => c.componentID === componentId)
        let control: ControlPropType = undefined
        if(list.length > 0)
          control = list.find(c => c.componentValue === value) ? list.find(c => c.componentValue === value).controlProp : undefined
        if(control)
          switch (control.toString()) {
            case "DISABLED":
              this.enabled = false;
              break;
            case "ENABLED":
              this.enabled = true;
              break;
            case "INVISIBLE":
              this.visible = false;
              break;
            case "VISIBLE":
              this.visible = true;
              break;
          }
      }
    })
  }

  getNormalizeText(headerObject: Header | SubHeader): string{
    return (('column' in headerObject) ?
      this.tableProp.header.map(value => value.subHeader).flat().find(value => value.order === headerObject.order).title :
      this.tableProp.header.find(value => value.order === headerObject.order).title)
      .replaceAll("\n", "<br>")
  }


  addRow() {
    let newRow = new Array(this.columnNum)
    this.tableProp.header.map(value1 => value1.subHeader).flat().map(value1 => {
      newRow[value1.order] = value1.column.defaultValue
    })

    this.tableData.push(newRow)
    this.setValue()
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

  update(): void {
  }

}
