import {Component, OnDestroy} from '@angular/core';
import {AddressService} from "../../../services/address.service";
import {
  ComponentBound,
  ControlPropType,
  IceComponent,
  MasterControl, PlaceObject,
  TextPosition
} from "../../../interfaces/interfaces";
import {CellService} from "../../../services/cell.service";
import {ComponentService} from "../../../services/component.service";
import {IceComponentType} from "../../../constants";
import {Subscription} from "rxjs";
import {map} from "rxjs/operators";


@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css']
})
export class AddressComponent implements IceComponent, OnDestroy{
  region: string = ""
  regionError = false

  regionList: PlaceObject[];

  constructor(public addressService: AddressService,private cellService: CellService, private componentService: ComponentService) {
    console.log("AddressComponent constructor worked")
    addressService.getAllRegion().subscribe({
      next: res => {
        console.log(res)
        this.regionList = res
      }
    })


  }

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
  value: any;
  private _frameColor: string;

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
      console.log("area:",item)
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

}
