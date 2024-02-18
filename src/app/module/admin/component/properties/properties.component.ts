import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ComponentService} from "../../../../services/component.service";
import {Subscription} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {MasterControlPropComponent} from "../master-control-prop/master-control-prop.component";
import {
  dialogCloseAnimationDuration,
  dialogOpenAnimationDuration,
  DOCUMENT_LOAD_ERROR,
  IceComponentType, SET_COMPONENT_NAME_DUPLICATE
} from "../../../../constants";
import {IceMaketComponent} from "../../classes/icecomponentmaket";
import {ComponentType} from "@angular/cdk/overlay";
import {OptionListComponent} from "../option-list/option-list.component";
import {EventObject, EventObjectType} from "../../../../interfaces/interfaces";
import {EventService} from "../../../../services/event.service";
import {EventControlPropComponent} from "../event-control-prop/event-control-prop.component";
import {DocumentService} from "../../../../services/document.service";
import {MessageService} from "../../../../services/message.service";

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.css']
})
export class PropertiesComponent implements OnInit, OnDestroy {

  @Input()
  propPanelCurrentSize: number;
  @Input()
  propPanelOpenWidth: number;
  @Input()
  currentDocId: number | undefined

  selectedComponent$: Subscription
  currentComponent: IceMaketComponent

  private _addFrame = false

  get addFrame(): boolean {
    this._addFrame = this.currentComponent.frameColor !== undefined
    return this._addFrame;
  }

  set addFrame(value: boolean) {
    this._addFrame = value;
    if(value) this.currentComponent.frameColor = "#000000"
    else this.currentComponent.frameColor = undefined
  }

  constructor(private componentService: ComponentService,
              public dialog: MatDialog,
              public eventService: EventService,
              private documentService: DocumentService,
              private messageService: MessageService) {
  }

  ngOnDestroy(): void {
    if(this.selectedComponent$)
        this.selectedComponent$.unsubscribe()
    }


  ngOnInit(): void {
    this.selectedComponent$ = this.componentService.selectedComponent$.subscribe(c => {
      if (c === undefined)
        this.currentComponent = undefined
      else {
        this.currentComponent = <IceMaketComponent>this.componentService.getComponent(c)
        this.componentService.setModified(true)

        if(this.currentComponent.printRule === undefined){
          this.currentComponent.printRule = {isPrint: this.currentComponent.componentType != IceComponentType.TEXT,newLine: true}
        }
      }
    })


  }

  openEventControlDialog(){
    this.openDialog(dialogOpenAnimationDuration, dialogCloseAnimationDuration, EventControlPropComponent)
  }

  openMasterControlDialog(){
    this.openDialog(dialogOpenAnimationDuration, dialogCloseAnimationDuration, MasterControlPropComponent)
  }

  openOptionsDialog() {
    this.openDialog(dialogOpenAnimationDuration, dialogCloseAnimationDuration, OptionListComponent)
  }

  openDialog<T>(enterAnimationDuration: string, exitAnimationDuration: string, component: ComponentType<T>): void {
    let componentRef = this.dialog.open(component, {
      width: '' + (window.innerWidth * 0.8) + 'px',
      height: '' + (window.innerHeight * 0.8) + 'px',
      enterAnimationDuration,
      exitAnimationDuration,
    })
    // @ts-ignore
    componentRef.componentInstance.currentComponent = this.currentComponent
    // @ts-ignore
    componentRef.componentInstance.currentDocId = this.currentDocId
    // @ts-ignore
    componentRef.componentInstance.init()
  }

  addRow() {
    if(this.currentComponent.value){
      this.currentComponent.value.push("")
    } else {
      this.currentComponent.value = []
      this.currentComponent.value.push("")
    }
  }

  removeRow() {
    if(this.currentComponent.value){
      this.currentComponent.value.splice(this.currentComponent.value.length - 1 , 1)
    } else {
      this.currentComponent.value = []
    }
  }

  checkComponentName() {
    if(!this.documentService.getComponentByName(this.currentDocId, this.currentComponent.componentName))
      return
    this.messageService.show(SET_COMPONENT_NAME_DUPLICATE,"","ERROR").subscribe(value =>
      this.currentComponent.componentName = undefined)
  }
}
