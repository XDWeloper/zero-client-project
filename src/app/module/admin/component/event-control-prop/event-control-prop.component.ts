import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from "@angular/material/icon";
import {MatDialogRef} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {IceMaketComponent} from "../../classes/icecomponentmaket";
import {IceEvent} from "../../../../interfaces/interfaces";
import {EventNameTitle, EventService} from "../../../../services/event.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DocumentService} from "../../../../services/document.service";
import {IWorker} from "../../../../workers/workerModel";

interface LocalWorker {workerName: string, workerId: number}

@Component({
  selector: 'app-event-control-prop',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './event-control-prop.component.html',
})
export class EventControlPropComponent {
  localEvent: IceEvent[] = []
  allWorkerList: LocalWorker[]  = []
  currentEventWorkerList: LocalWorker[]  = []
  currentComponent: IceMaketComponent
  currentDocId: number
  private _currentEventName: string = ""
  private workers: IWorker[];
  eventList:EventNameTitle[] = []
  protected _selectedCurrentWorkerItem: LocalWorker | undefined = undefined;
  protected _selectedAllWorkerItem: LocalWorker  | undefined  = undefined;


  constructor(public dialogRef: MatDialogRef<EventControlPropComponent>, protected eventService: EventService, private documentService: DocumentService) {
  }


  set selectedAllWorkerItem(value: LocalWorker) {
    this._selectedAllWorkerItem = value;
    this._selectedCurrentWorkerItem = undefined
  }

  set selectedCurrentWorkerItem(value: LocalWorker) {
    this._selectedCurrentWorkerItem = value;
    this._selectedAllWorkerItem = undefined
  }

  get currentEventName(): string {
    return this._currentEventName;
  }

  set currentEventName(value: string) {
    this._currentEventName = value;
    this.setEventWorkerList(value)
  }

  init() {
    this.eventList = this.eventService.getEventNameAndTitleList('COMPONENT')
    this.localEvent.push(...(this.currentComponent.componentEvent ?? []))
    this.workers = this.documentService.getTemplateByDocId(this.currentDocId).docAttrib.workerList

    if(this.localEvent.length > 0)
      this.currentEventName = this.localEvent[0].eventName
  }

    close() {
    this.dialogRef.close()
  }

  saveAndClose() {
    if(!this.currentComponent.componentEvent)
      this.currentComponent.componentEvent = []
    this.currentComponent.componentEvent.splice(0, this.currentComponent.componentEvent.length)
    this.currentComponent.componentEvent.push(...this.localEvent)
    this.dialogRef.close()
  }

  private setEventWorkerList(eventName: string) {
    this.currentEventWorkerList.splice(0,this.currentEventWorkerList.length)
    this.allWorkerList.splice(0,this.allWorkerList.length)

    let currentEventWorkerIdList = this.localEvent.find(value1 => value1.eventName === eventName) != undefined
                                              ? this.localEvent.find(value1 => value1.eventName === eventName).workerIdList
                                              : []

    this.allWorkerList.push(...this.workers.filter(value1 => !currentEventWorkerIdList.includes(value1.id)).map(value1 =>{return {workerName: value1.name, workerId: value1.id}}))

    if(currentEventWorkerIdList) {
      this.currentEventWorkerList.push(...this.workers.filter(value1 => currentEventWorkerIdList.includes(value1.id)).map(value1 => {
        return {workerName: value1.name, workerId: value1.id}
      }))
    }

    if(this._selectedAllWorkerItem && this.allWorkerList.length > 0)
      this.selectedAllWorkerItem = this.allWorkerList[0]

    if(this._selectedCurrentWorkerItem && this.currentEventWorkerList.length > 0)
      this.selectedCurrentWorkerItem = this.currentEventWorkerList[0]
  }

  fromAllToCurrent() {
    let localEvent = this.localEvent.find(value =>  value.eventName === this.currentEventName)
    if(localEvent === undefined)
       this.localEvent.push( {eventName: this.currentEventName,workerIdList:[]})
    this.localEvent.find(value => value.eventName=== this.currentEventName).workerIdList.push(this._selectedAllWorkerItem.workerId)
    this.setEventWorkerList(this.currentEventName)
  }

  fromCurrentToAll() {
    let workerIdList= this.localEvent.find(value => value.eventName=== this.currentEventName).workerIdList
    let findedIndex = workerIdList.findIndex(value => value === this._selectedCurrentWorkerItem.workerId)
    if(findedIndex != undefined)
      workerIdList = workerIdList.splice(findedIndex, 1)
    this.setEventWorkerList(this.currentEventName)

  }

  clearAllEvent() {
    this.localEvent.splice(0,this.localEvent.length)
    this.setEventWorkerList(this.currentEventName)
  }
}
