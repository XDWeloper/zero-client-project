import {Component, OnDestroy} from '@angular/core';
import {CellService} from "../../../services/cell.service";
import {
  ComponentBound,
  ComponentInputType,
  ComponentRuleForPDF,
  ControlPropType,
  IceComponent,
  MasterControl, OptionList,
  TextPosition
} from "../../../interfaces/interfaces";
import {AlertColor, IceComponentType} from "../../../constants";
import {ComponentService} from "../../../services/component.service";
import {Subscription} from "rxjs";
import {computeStartOfLinePositions} from "@angular/compiler-cli/src/ngtsc/sourcemaps/src/source_file";


@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
})
export class InputComponent implements IceComponent, OnDestroy {

  constructor(private cellService: CellService, private componentSelectedService: ComponentService, private componentService: ComponentService) {
  }

  tableType: number;

  optionList?: OptionList[] | undefined
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

  private _value: any;
  height: any;
  width: any;
  top: any;
  left: any;
  localBorderColor: string

  private changeValue$: Subscription
  enabled : boolean
  visible : boolean



  ngOnInit(): void {

    if(this.inputType === 'button')
      this.value = this.placeHolder

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
        this.localBorderColor = (item.checkedText && item.checkedText.length > 0) ? AlertColor : this.frameColor
        this.checkedText = item.checkedText
      }

      if (componentId === this.componentID || value === undefined) return

      if (this.masterControlList) {
        let list = this.masterControlList.filter(c => c.componentID === componentId)
        let control: ControlPropType = undefined
        if(list.length > 0)
          control = list.find(c => c.componentValue === value) ? list.find(c => c.componentValue === value).controlProp : undefined
        if(control) {
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
      }
    })
  }


  get value(): any {
    return this._value;
  }

  set value(value: any) {
    if (value === undefined && this.inputType === 'checkbox')
      value = false
    if (value === undefined) return
    if (this.inputType === 'checkbox') {
      this.checked = value
    }
      this._value = value;
    //this.checkValid()
    if(this.componentID && this.visible) {
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

  ngOnDestroy(): void {
    if(this.changeValue$)
      this.changeValue$.unsubscribe()
  }

  // checkValid(): boolean {
  //   if(this.value){
  //     if(this.inputType === 'number'){
  //       return !(this.maxVal < this.value || this.minVal > this.value)
  //     }
  //     if(this.inputType === 'text') {
  //       return !(this.maxLength < this.value.length || this.minLength > this.value.length)
  //     }
  //   }
  //   return true
  // }

}
