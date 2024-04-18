import { Component } from '@angular/core';
import {IceMaketComponent} from "../../classes/icecomponentmaket";
import {ControlPropType, ControlValue, MasterControl, OptionList, StepControl} from "../../../../interfaces/interfaces";
import {MatDialogRef} from "@angular/material/dialog";
import {DocumentService} from "../../../../services/document.service";
import {MasterControlPropComponent} from "../master-control-prop/master-control-prop.component";

@Component({
  selector: 'app-option-list',
  templateUrl: './option-list.component.html',
})
export class OptionListComponent {
  currentComponent: IceMaketComponent
  currentDocId: number
  localOptionList: OptionList[]  = []


  constructor(public dialogRef: MatDialogRef<MasterControlPropComponent>, private documentService: DocumentService) {
  }

  init(){
    if(this.currentComponent.optionList)
      this.currentComponent.optionList.forEach(i => this.localOptionList.push({data:i.data,value: i.value}))
  }

  addRow() {
    this.localOptionList.push({data:"",value: ""})
  }

  removeRow() {
    if(this.localOptionList.length > 0)
      this.localOptionList.splice(this.localOptionList.length - 1,1)
  }

  clearTable() {
    this.localOptionList.splice(0,this.currentComponent.optionList.length)
  }

  close() {
    this.dialogRef.close()
  }

  save() {
    if(!this.currentComponent.optionList)
      this.currentComponent.optionList = []

    this.loadOptions()
    this.close()
  }

  loadOptions(){
    this.currentComponent.optionList.splice(0,this.currentComponent.optionList.length)
    this.localOptionList.forEach(i => this.currentComponent.optionList.push({data:i.data,value: i.value}))
  }
}
