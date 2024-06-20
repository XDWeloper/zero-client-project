import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ComponentService} from "../../../../services/component.service";
import {Subscription} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {MasterControlPropComponent} from "../master-control-prop/master-control-prop.component";
import {
  dialogCloseAnimationDuration,
  dialogOpenAnimationDuration,
  IceComponentType,
  SET_COMPONENT_NAME_DUPLICATE
} from "../../../../constants";
import {IceMaketComponent} from "../../classes/icecomponentmaket";
import {ComponentType} from "@angular/cdk/overlay";
import {OptionListComponent} from "../option-list/option-list.component";
import {EventService} from "../../../../services/event.service";
import {EventControlPropComponent} from "../event-control-prop/event-control-prop.component";
import {DocumentService} from "../../../../services/document.service";
import {MessageService} from "../../../../services/message.service";
import {CheckRadioGroup} from "../../../../interfaces/interfaces";
import {RadioGroupPropComponent} from "../radio-group-prop/radio-group-prop.component";
import {isTemplateDiagnostic} from "@angular/compiler-cli/src/ngtsc/typecheck/diagnostics";

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
        // if(this.currentComponent.printRule === undefined){
        //   this.currentComponent.printRule = {isPrint: this.currentComponent.componentType != IceComponentType.TEXT,newLine: true}
        // }
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

  openDialog<T>(enterAnimationDuration: string, exitAnimationDuration: string, component: ComponentType<T>, rect?:{xSize: number, ySize: number} ): void {
    let xSize = rect ? rect.xSize / 100 : 0.8
    let ySize = rect ? rect.ySize / 100 : 0.8

    let componentRef = this.dialog.open(component, {
      width: '' + (window.innerWidth * xSize) + 'px',
      height: '' + (window.innerHeight * ySize) + 'px',
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

  checkComponentName(): boolean {
    /*
    if(this.currentComponent === undefined)
      return true
    if(!this.documentService.getComponentByName(this.currentDocId, this.currentComponent))
      return true
    this.messageService.show(SET_COMPONENT_NAME_DUPLICATE,"","ERROR").subscribe(value=> {
      //this.currentComponent.componentName = this.currentComponent.componentName
      }
    )
    */
    return false;
  }

  getRadioGroupList(): CheckRadioGroup[]{
    if(this.documentService.getTemplateByDocId(this.currentDocId).docAttrib.checkGroupList){
      return this.documentService.getTemplateByDocId(this.currentDocId).docAttrib.checkGroupList
    }
    return null
  }

  openRadioGroupDialog() {
    this.openDialog(dialogOpenAnimationDuration, dialogCloseAnimationDuration, RadioGroupPropComponent, {xSize: 50,ySize: 50})
  }



  protected readonly IceComponentType = IceComponentType;

  setRadioGroupID($event: number) {
    this.currentComponent.radioGroupID = $event

    let checkGroupList = this.documentService.getTemplateByDocId(this.currentDocId).docAttrib.checkGroupList

    if($event){
      let checkedGroup = checkGroupList.find(item => item.id === Number($event))
      if(!checkedGroup.checkList)
      checkedGroup.checkList = []

      if(checkedGroup.checkList.map(item => item.id).includes(this.currentComponent.componentID) === false){
        checkedGroup.checkList.push({id:this.currentComponent.componentID,name:this.currentComponent.componentName})
      }
    } else{
      checkGroupList.forEach(value => {
        let index = value.checkList.findIndex(item => item.id === this.currentComponent.componentID)
        if(index != -1){
          value.checkList.splice(index,1)
        }
      })
    }
  }
}
