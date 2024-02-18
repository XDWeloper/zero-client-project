import {Component, OnDestroy} from '@angular/core';
import {ComponentService} from "../../../services/component.service";
import {CellService} from "../../../services/cell.service";
import {
  ComponentBound, ComponentInputType,
  ComponentRuleForPDF,
  ControlPropType,
  IceComponent,
  IceEvent,
  MasterControl,
  TableProperties,
  TextPosition
} from "../../../interfaces/interfaces";
import {AlertColor, IceComponentType} from "../../../constants";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-area',
  templateUrl: './area.component.html',
})
export class AreaComponent implements IceComponent, OnDestroy {

  constructor(private cellService: CellService, private componentService: ComponentService) {
  }

  tableProp?: TableProperties;
    componentEvent?: IceEvent[];
    update(): void {
        throw new Error('Method not implemented.');
    }

  tableType: number;

  optionList?: string[];
  printRule: ComponentRuleForPDF;
  masterControlList: MasterControl[];

  minLength: number;
  maxLength: number;
  regExp: string;
  minVal: number;
  maxVal: number;

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
  required: boolean;
  textPosition: TextPosition;
  frameColor: string;
  notification: string | undefined;
  checkedText: string | undefined = undefined

  private _value: any;
  height: any;
  width: any;
  top: any;
  left: any;
  localBorderColor: string

  enabled = true
  visible = true

  private changeValue$: Subscription


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

      if (this.masterControlList && this.masterControlList.length > 0) {
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

  ngOnDestroy(): void {
    if(this.changeValue$)
      this.changeValue$.unsubscribe()

  }

  get value(): any {
    return this._value;
  }

  set value(value: any) {
    this._value = value;
    this.componentService.setComponentValue({componentId: this.componentID, value: value})
    this.checkValid()
  }

  checkValid() {
      if ((!this.value && this.required) || (this.value && (this.maxLength < this.value.length || this.minLength > this.value.length)))
        this.localBorderColor = AlertColor
      else
        this.localBorderColor = this.frameColor
  }

  changeComponent() {
    this.componentService.selectedDocumentComponent$.next(this)
  }

}
