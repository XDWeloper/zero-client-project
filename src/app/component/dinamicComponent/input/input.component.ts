import {Component} from '@angular/core';
import {CellService} from "../../../services/cell.service";
import {
  ComponentBound,
  ControlPropType,
  IceComponent,
  MasterControl,
  TextPosition
} from "../../../interfaces/interfaces";
import {AlertColor, IceComponentType} from "../../../constants";
import {ComponentService} from "../../../services/component.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
})
export class InputComponent implements IceComponent {

  constructor(private cellService: CellService, private componentSelectedService: ComponentService, private componentService: ComponentService) {
  }

  masterControlList: MasterControl[];

  minLength: number;
  maxLength: number;
  regExp: string;
  minVal: number;
  maxVal: number;

  private _frameColor: string;
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
  inputType: string;
  textPosition: TextPosition;
  notification: string | undefined;
  checked: boolean = false

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
      if (componentId === this.componentID || value === undefined) return

      if (this.masterControlList) {
        let list = this.masterControlList.filter(c => c.componentID === componentId)
        let control: ControlPropType = undefined
        if(list.length > 0)
          control = list.find(c => c.componentValue === value).controlProp
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


  get frameColor(): string {
    return this._frameColor;
  }

  set frameColor(value: string) {
    this._frameColor = value;
    this.localBorderColor = this.frameColor
  }

  get value(): any {
    return this._value;
  }

  set value(value: any) {
    if (value === undefined) return
    if (this.inputType === 'checkbox') {
      this.checked = value
    }
      this._value = value;
    this.checkValid()
    if(this.componentID) {
      this.componentService.setComponentValue({componentId: this.componentID, value: value})
    }
  }

  select($event: any) {
    this.componentSelectedService.selectedDocumentComponent$.next(this)
    if (this.inputType === 'checkbox') {
      this.checked = !this.checked
      this.value = this.checked
    }
  }

  checkValid() {
    if(this.value){
      if(this.inputType === 'number'){
        if (this.maxVal < this.value || this.minVal > this.value)
          this.localBorderColor = AlertColor
        else
          this.localBorderColor = this.frameColor
      }
      if(this.inputType === 'text') {
        if (this.maxLength < this.value.length || this.minLength > this.value.length)
          this.localBorderColor = AlertColor
        else
          this.localBorderColor = this.frameColor
      }
    }
  }

}
