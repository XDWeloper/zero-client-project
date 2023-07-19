import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {
  ComponentBound,
  ControlPropType,
  IceComponent,
  MasterControl,
  TextPosition
} from "../../../interfaces/interfaces";
import {CellService} from "../../../services/cell.service";
import {ComponentService} from "../../../services/component.service";
import {dialogCloseAnimationDuration, dialogOpenAnimationDuration, IceComponentType} from "../../../constants";
import {Subscription} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {ChangePlaceDialogComponent, LevelClass} from "../../change-place-dialog/change-place-dialog.component";

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressComponent implements IceComponent, OnDestroy {

  cellNumber: number;
  componentBound: ComponentBound;
  componentID: number;
  componentName: string;
  componentType: IceComponentType;
  correctX: number;
  correctY: number;
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
  private _value: any;
  private _frameColor: string;

  height: any;
  width: any;
  top: any;
  left: any;
  localBorderColor: string

  enabled = true
  visible = true

  private changeValue$: Subscription
  stringValue: string = ""

  constructor(private cellService: CellService, private componentService: ComponentService, private changeDetection: ChangeDetectorRef, public dialog: MatDialog) {
  }

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
        let control: ControlPropType = this.masterControlList.filter(c => c.componentID === componentId).find(c => c.componentValue === value).controlProp
        console.log(control.toString())


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
    if (this.changeValue$)
      this.changeValue$.unsubscribe()
  }

  get frameColor(): string {
    return this._frameColor;
  }

  set frameColor(value: string) {
    this._frameColor = value;
    this.localBorderColor = this._frameColor
  }

  openPlaceDialog() {
    this.openDialog(dialogOpenAnimationDuration, dialogCloseAnimationDuration)
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    let componentRef = this.dialog.open(ChangePlaceDialogComponent, {
      width: '' + (window.innerWidth * 0.8) + 'px',
      height: '' + (window.innerHeight * 0.8) + 'px',
      enterAnimationDuration,
      exitAnimationDuration,
    })
    componentRef.componentInstance.placeList.subscribe({
      next: (val: LevelClass[]) => {
        this.value = val
      }
    })
    if(this.value)
      componentRef.componentInstance.placeClassList = this.value
  }

  get value(): any {
    return this._value;
  }

  set value(value: LevelClass[]) {
    if(!value) return
    this.stringValue = ""
    value.filter(p => p.levelValue).forEach(place => {
      this.stringValue = (this.stringValue ? this.stringValue : "") + place.levelValue.typeName + "." + place.levelValue.name + ","
    })
    this._value = value;
    this.changeDetection.detectChanges()
    this.componentService.setComponentValue({componentId: this.componentID, value: value})
  }

}
