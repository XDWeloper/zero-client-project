import {Component} from '@angular/core';
import {CellService} from "../../../services/cell.service";
import {
  ComponentBound,
  ComponentInputType,
  ComponentRuleForPDF,
  ControlPropType,
  IceComponent,
  IceEvent,
  MasterControl,
  TableProperties,
  TextPosition
} from "../../../interfaces/interfaces";
import {AlertColor, IceComponentType} from "../../../constants";
import {ComponentService} from "../../../services/component.service";
import {of, Subscription} from "rxjs";

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
})
export class SelectComponent implements IceComponent {

  constructor(private cellService: CellService, private componentService: ComponentService) {
  }

  tableProp?: TableProperties;
  componentEvent?: IceEvent[];
  tableType: number;
  printRule: ComponentRuleForPDF;
  masterControlList: MasterControl[];
  minLength: number;
  maxLength: number;
  regExp: string;
  minVal: number;
  maxVal: number;

  frameColor: string;
  required: boolean;
  cellNumber: number;
  componentBound: ComponentBound;
  componentID: number;
  componentName: string;
  componentType: IceComponentType;
  placeHolder: string;
  correctX: number;
  correctY: number;
  stepNum: number;
  inputType: ComponentInputType;
  textPosition: TextPosition;
  notification: string | undefined;
  checked: boolean = false
  checkedText: string | undefined = undefined
  optionList?: string[] | undefined

  private _value: any;
  height: any;
  width: any;
  top: any;
  left: any;
  localBorderColor: string

  private changeValue$: Subscription
  enabled = true
  visible = true

  ngOnInit(): void {
    this.height = this.cellService.getClientCellHeight() * this.componentBound.heightScale
    this.width = this.cellService.getClientCellWidth() * this.componentBound.widthScale
    this.left = this.cellService.getClientCellBound(this.cellNumber).x - this.correctX
    this.top = this.cellService.getClientCellBound(this.cellNumber).y - this.correctY
    this.propControl()
  }

  private propControl() {
    this.changeValue$ = this.componentService.changeValue$.subscribe(item => {
      let componentId = item.componentId
      let value = item.value


      if(componentId === this.componentID && value === "NaN") {
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

  get value(): any {
    return this._value;
  }

  set value(value: any) {
    this.localBorderColor = value === undefined && this.required ? AlertColor : this.frameColor

    if (value === undefined) {
      //this._value = -888888888888
      this._value = value
      return
    }
    this._value = value;
    if(this.componentID) {
      this.componentService.setComponentValue({componentId: this.componentID, value: value})
    }
  }
  changeComponent() {
    this.componentService.selectedDocumentComponent$.next(this)
  }

}
