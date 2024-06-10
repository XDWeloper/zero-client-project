import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatDialogRef} from "@angular/material/dialog";
import {MasterControlPropComponent} from "../master-control-prop/master-control-prop.component";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ChangeWorkerComponent} from "../change-worker/change-worker.component";
import {IceMaketComponent} from "../../classes/icecomponentmaket";
import {DocumentService} from "../../../../services/document.service";
import {CheckRadioGroup, IceDocumentMaket} from "../../../../interfaces/interfaces";
import {IceInputComponent} from "../../../share-component/ice-input/ice-input.component";
import {A11yModule} from "@angular/cdk/a11y";

@Component({
  selector: 'app-radio-group-prop',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, ReactiveFormsModule, ChangeWorkerComponent, IceInputComponent, FormsModule, A11yModule],
  templateUrl: './radio-group-prop.component.html',
})
export class RadioGroupPropComponent {

  currentComponent: IceMaketComponent
  currentDocId: number
  privateGroupList:CheckRadioGroup[]
  currentTemplate: IceDocumentMaket
  currentGroup:CheckRadioGroup
  newGroup:CheckRadioGroup | undefined = undefined
  newGroupName: string;
  setNewGroupName: boolean = false;


  constructor(public dialogRef: MatDialogRef<MasterControlPropComponent>, private documentService: DocumentService) {
  }

  init(){
    this.currentTemplate = this.documentService.getTemplateByDocId(this.currentDocId)
    if(this.currentTemplate.docAttrib.checkGroupList)
      this.privateGroupList = [...this.currentTemplate.docAttrib.checkGroupList]
    else
      this.privateGroupList = []
  }


  saveAndClose() {
    if(this.currentTemplate.docAttrib.checkGroupList){
      this.currentTemplate.docAttrib.checkGroupList.splice(0,this.currentTemplate.docAttrib.checkGroupList.length)
    } else
      this.currentTemplate.docAttrib.checkGroupList = []

    this.currentTemplate.docAttrib.checkGroupList.push(...this.privateGroupList)


    this.close()
  }

  close(){
    this.dialogRef.close()
  }

  addGroup() {
    let newGroupNumber = 0
    if(this.privateGroupList.length > 0) {
      newGroupNumber = Math.max(...this.privateGroupList.map(value => value.id)) + 1
    }
    this.newGroupName = "Группа " + newGroupNumber
    this.newGroup = {id: newGroupNumber,name: this.newGroupName,checkList:[]}
    this.setNewGroupName = true
  }

  listenKey($event: KeyboardEvent) {
    if($event.key === "Enter") {
      this.newGroup.name = this.newGroupName
      this.privateGroupList.push({...this.newGroup})
      this.setNewGroupName = false
      this.currentGroup = {...this.newGroup}
    }
    if($event.key === "Escape"){
      this.setNewGroupName = false
      this.newGroup = undefined
    }
  }

  editGroupName(group: CheckRadioGroup) {
    this.newGroupName = group.name
    this.newGroup = {...group}
    this.setNewGroupName = true
    this.removeGroup(group)
  }

  removeGroup(group: CheckRadioGroup){
    this.privateGroupList.splice(this.privateGroupList.findIndex(value => value.id === group.id), 1)
  }

}
