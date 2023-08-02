import {Component} from '@angular/core';
import {ControlPropType, ControlValue, MasterControl, StepControl} from "../../../../interfaces/interfaces";
import {MatDialogRef} from "@angular/material/dialog";
import {DocumentService} from "../../../../services/document.service";
import {IceMaketComponent} from "../../classes/icecomponentmaket";



@Component({
  selector: 'app-master-control-prop',
  templateUrl: './master-control-prop.component.html'
})
export class MasterControlPropComponent {
  currentComponent: IceMaketComponent
  componentStepList: Array<StepControl>
  currentDocId: number
  controlValue: Array<ControlValue> = []
  controlProp: Array<ControlValue> = []


  constructor(public dialogRef: MatDialogRef<MasterControlPropComponent>, private documentService: DocumentService) {
  }

  init(){
    this.componentStepList = this.documentService.getMaketComponentList(this.currentDocId, this.currentComponent.componentID)
      let valuesArr = Object.values(ControlPropType)
      let keyArr = Object.keys(ControlPropType)
      for(let i = 0; i < valuesArr.length ;i++){
        this.controlProp.push({name:valuesArr[i],value:keyArr[i]})
      }
      this.setCheckBoxVals()
  }



  addRow() {
    if(this.currentComponent.masterControlList === undefined)
      this.currentComponent.masterControlList = []
    this.currentComponent.masterControlList.push(new MasterControl())
  }

  removeRow() {
    if(this.currentComponent.masterControlList)
      this.currentComponent.masterControlList.splice(this.currentComponent.masterControlList.length - 1,1)
  }

  clearTable() {
    this.currentComponent.masterControlList
      this.currentComponent.masterControlList.splice(0,this.currentComponent.masterControlList.length)
  }

  close() {
    this.dialogRef.close()
  }

  select(componentId: number) {
    let component: any = undefined
    this.componentStepList.forEach(s => {
      if(!component)
        component = s.component.find(c => c.componentID === componentId)
    })
    if(component){
      this.controlValue.splice(0,this.controlValue.length)
      if(component.inputType === "checkbox"){
        this.setCheckBoxVals();
      }
    }
  }

  private setCheckBoxVals() {
    this.controlValue.push({name: "Вкл", value: true}, {name: "Выкл", value: false})
  }
}
