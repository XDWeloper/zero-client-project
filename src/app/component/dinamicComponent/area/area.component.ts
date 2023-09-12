import {Component, OnDestroy} from '@angular/core';
import {ComponentService} from "../../../services/component.service";
import {CellService} from "../../../services/cell.service";
import {
  ComponentBound,
  ControlPropType,
  IceComponent,
  MasterControl,
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
  inputType: string;
  required: boolean;
  textPosition: TextPosition;
  private _frameColor: string;
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
        if(item.checkedText && item.checkedText.length > 0)
          this.localBorderColor = AlertColor
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


  get frameColor(): string {
    return this._frameColor;
  }

  set frameColor(value: string) {
    this._frameColor = value;
    this.localBorderColor = this._frameColor
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
    if(this.value){
      if (this.maxLength < this.value.length || this.minLength > this.value.length)
        this.localBorderColor = AlertColor
      else
        this.localBorderColor = this.frameColor
    }
  }

  changeComponent() {
    this.componentService.selectedDocumentComponent$.next(this)
  }

}
