import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {
  ComponentBound, ComponentInputType,
  ComponentRuleForPDF,
  ControlPropType,
  IceComponent,
  IceEvent,
  MasterControl, OptionList, PlaceObject,
  TableProperties,
  TextPosition
} from "../../../interfaces/interfaces";
import {CellService} from "../../../services/cell.service";
import {ComponentService} from "../../../services/component.service";
import {
  dialogCloseAnimationDuration,
  dialogOpenAnimationDuration,
  IceComponentType
} from "../../../constants";
import {Subscription} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {ChangePlaceDialogComponent } from "../../change-place-dialog/change-place-dialog.component";

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
  inputType: ComponentInputType;
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
  checkedText: string | undefined
  private _value: { placeList: PlaceObject[], placeString: string };
  frameColor: string;

  height: any;
  width: any;
  top: any;
  left: any;

  enabled = true
  private _visible = true

  private changeValue$: Subscription
  private _stringValue: string = ""

  constructor(private cellService: CellService, private componentService: ComponentService, private changeDetection: ChangeDetectorRef, public dialog: MatDialog) {
  }

  tableProp?: TableProperties;
    componentEvent?: IceEvent[];
    update(): void {
        throw new Error('Method not implemented.');
    }

  tableType: number;

  optionList?: OptionList[] | undefined
    printRule: ComponentRuleForPDF;

  ngOnInit(): void {
    this.height = this.cellService.getClientCellHeight() * this.componentBound.heightScale
    this.width = this.cellService.getClientCellWidth() * this.componentBound.widthScale
    this.left = this.cellService.getClientCellBound(this.cellNumber).x - this.correctX
    this.top = this.cellService.getClientCellBound(this.cellNumber).y - this.correctY

    this.changeDetection.detectChanges()
    this.propControl()
  }

  private propControl() {
    this.changeValue$ = this.componentService.changeValue$.subscribe(item => {

      let componentId = item.componentId
      let value = item.value

      if(componentId === this.componentID && value === "NaN") {
        this.checkedText = item.checkedText
        this.changeDetection.detectChanges()
      }

      if (componentId === this.componentID || value === undefined) return

      if (this.masterControlList && this.masterControlList.length > 0) {
        let list = this.masterControlList.filter(c => c.componentID === componentId)
        let control: ControlPropType = undefined

        if (list.length > 0)
          control = list.find(c => c.componentValue === value) ? list.find(c => c.componentValue === value).controlProp : undefined

        if (control){
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
          this.changeDetection.detectChanges()
        }
      }
    })
  }

  ngOnDestroy(): void {
    if (this.changeValue$)
      this.changeValue$.unsubscribe()
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
      next: (val: { placeList: PlaceObject[], placeString: string }) => this.value = val
    })
    if (this.value)
      componentRef.componentInstance.reCreatedLevels(this.value.placeList.filter((i: PlaceObject) => i))
  }

  get value(): { placeList: PlaceObject[], placeString: string } {
    return this._value;
  }

  set value(value: { placeList: PlaceObject[], placeString: string }) {
    if (!value) return
    this._stringValue = value.placeString ? value.placeString : ""

    if (this._stringValue.length < 1 && Array.isArray(value.placeList)) {
      value.placeList.forEach(place => {
        let typeName = place.typeName ? place.typeName : ''
        if (typeName.length > 0 && place.clevel != 1)
           typeName = typeName.charAt(typeName.length - 1) != '.' ? typeName + '.' : typeName

        let objectStr = place.clevel != 1 ?  `${typeName}${place.name ? place.name : ''}` : `${place.name ? place.name : ''}${' ' + typeName}`

        this._stringValue = `${this._stringValue ? this._stringValue : ''}` +
          `${objectStr}` +
          `${place.shortName ? place.shortName : ''}${place.cnumber ? place.cnumber : ''}` +
          `${place.domType ? place.domType : ''}${place.dom ? place.dom : ','}` +
          `${place.korp ? ' Корпус ' + place.korp : ''} ${place.str ? 'Строение ' + place.str : ''}`
      })
    }

    this._value = {placeList: value.placeList, placeString: this._stringValue}
    this.componentService.setComponentValue({componentId: this.componentID, value: this._value})
    this.changeDetection.detectChanges()
  }


  get stringValue(): string {
    return this._stringValue;
  }

  set stringValue(value: string) {
    this.value = {placeList: [], placeString: value}
    this._stringValue = value;
  }

  get visible(): boolean {
    return this._visible;
  }

  set visible(value: boolean) {
    this._visible = value;
    this.changeDetection.detectChanges()
  }

}
