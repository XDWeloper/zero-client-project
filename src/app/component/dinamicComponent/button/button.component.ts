import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ComponentBound,
  ControlPropType,
  IceComponent,
  MasterControl,
  TextPosition
} from "../../../interfaces/interfaces";
import {AlertColor, IceComponentType} from 'src/app/constants';
import {Subscription} from "rxjs";
import {CellService} from "../../../services/cell.service";
import {ComponentService} from "../../../services/component.service";

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
})
export class ButtonComponent implements IceComponent{

  constructor(private cellService: CellService, private componentSelectedService: ComponentService, private componentService: ComponentService) {
    console.log("Button constructor")
  }

  cellNumber: number;
  componentBound: ComponentBound;
  componentID: number;
  componentName: string;
  componentType: IceComponentType;
  correctX: number;
  correctY: number;
  frameColor: string | undefined;
  inputType: string;
  masterControlList: MasterControl[];
  maxLength: number | undefined;
  maxVal: number | undefined;
  minLength: number | undefined;
  minVal: number | undefined;
  notification: string | undefined;
  placeHolder: string;
  regExp: string | undefined;
  required: boolean;
  stepNum: number;
  textPosition: TextPosition;
  checkedText: string | undefined = undefined

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

  get value(): any {
    return this._value;
  }

  set value(value: any) {
    this._value = value;
  }



}
