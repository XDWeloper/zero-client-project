import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {
  ComponentBound,
  ControlPropType,
  IceComponent,
  MasterControl,
  TextPosition
} from "../../../interfaces/interfaces";
import {CellService} from "../../../services/cell.service";
import {IceComponentType} from "../../../constants";
import {ComponentService} from "../../../services/component.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
})
export class TextComponent implements OnInit, IceComponent, OnDestroy {


  constructor(public sanitizer: DomSanitizer, private cellService: CellService,private componentService: ComponentService) {
  }

  masterControlList: MasterControl[];


  @ViewChild('component', {read: ElementRef})
  private component: ElementRef

  correctX: number;
  correctY: number;
  type = "text"
  cellNumber: number;
  componentBound: ComponentBound;
  componentID: number;
  componentName: string;
  componentType: IceComponentType;
  placeHolder: string;
  stepNum: number;
  inputType: string;
  required: boolean;
  textPosition: TextPosition;
  frameColor: string;
  minLength: number;
  maxLength: number;
  regExp: string;
  minVal: number;
  maxVal: number;
  notification: string | undefined;

  value: any;
  height: any;
  width: any;
  top: any;
  left: any;

  private changeValue$: Subscription

  enabled = true
  visible = true


  ngOnInit(): void {
    this.height = this.cellService.getClientCellHeight() * this.componentBound.heightScale
    this.width =  this.cellService.getClientCellWidth() * this.componentBound.widthScale
    this.left =   this.cellService.getClientCellBound(this.cellNumber).x - this.correctX
    this.top =    this.cellService.getClientCellBound(this.cellNumber).y - this.correctY
    this.propControl();
  }

  private propControl() {
    this.changeValue$ = this.componentService.changeValue$.subscribe(item => {
      let componentId = item.componentId
      let value = item.value
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



}
