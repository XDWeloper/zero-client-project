import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ComponentService} from "../../../../services/component.service";
import {Subscription} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {MasterControlPropComponent} from "../master-control-prop/master-control-prop.component";
import {dialogCloseAnimationDuration, dialogOpenAnimationDuration} from "../../../../constants";
import {IceMaketComponent} from "../../classes/icecomponentmaket";

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

  constructor(private componentService: ComponentService,public dialog: MatDialog) {
  }

  ngOnDestroy(): void {
        this.selectedComponent$.unsubscribe()
    }


  ngOnInit(): void {
    this.selectedComponent$ = this.componentService.selectedComponent$.subscribe(c => {
      if (c === undefined)
        this.currentComponent = undefined
      else {
        this.currentComponent = <IceMaketComponent>this.componentService.getComponent(c)
        this.componentService.setModified(true)
      }
    })
  }

  openMasterControlDialog(){
    this.openDialog(dialogOpenAnimationDuration, dialogCloseAnimationDuration)
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    let componentRef = this.dialog.open(MasterControlPropComponent, {

      width: '' + (window.innerWidth * 0.8) + 'px',
      height: '' + (window.innerHeight * 0.8) + 'px',
      enterAnimationDuration,
      exitAnimationDuration,
    })
      componentRef.componentInstance.currentComponent = this.currentComponent
      componentRef.componentInstance.currentDocId = this.currentDocId
      componentRef.componentInstance.init()
  }

}
