import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DataSourceFilterPipe} from "../../../../pipe/dataSource-filter.pipe";
import {IceInputComponent} from "../../../share-component/ice-input/ice-input.component";
import {MatIconModule} from "@angular/material/icon";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatTabsModule} from "@angular/material/tabs";
import {MatTooltipModule} from "@angular/material/tooltip";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatDialogRef} from "@angular/material/dialog";
import {IceDocumentMaket, IceEvent} from "../../../../interfaces/interfaces";
import {EventNameTitle, EventService} from "../../../../services/event.service";
import {DocumentService} from "../../../../services/document.service";
import {IWorker} from "../../../../workers/workerModel";

interface LocalWorker {workerName: string, workerId: number}

@Component({
  selector: 'app-document-settings',
  standalone: true,
  imports: [CommonModule, DataSourceFilterPipe, IceInputComponent, MatIconModule, MatSlideToggleModule, MatTabsModule, MatTooltipModule, ReactiveFormsModule, FormsModule],
  templateUrl: './document-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentSettingsComponent implements OnInit{

  localEvent: IceEvent[] = []
  allWorkerList: LocalWorker[]  = []
  currentEventWorkerList: LocalWorker[]  = []
  currentMaket: IceDocumentMaket
  private _currentEventName: string = ""
  private workers: IWorker[];
  eventList:EventNameTitle[] = []
  protected _selectedCurrentWorkerItem: LocalWorker | undefined = undefined;
  protected _selectedAllWorkerItem: LocalWorker  | undefined  = undefined;


  constructor(public dialogRef: MatDialogRef<DocumentSettingsComponent>, protected eventService: EventService, private documentService: DocumentService) {
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

  ngOnInit() {
    console.log(this.currentMaket)

    this.eventList = this.eventService.getEventNameAndTitleList('DOCUMENT')
    console.log(this.eventList)
    this.localEvent.push(...(this.currentMaket.docAttrib.documentEventList ?? []))
    this.workers = this.documentService.getTemplateByDocId(this.currentMaket.docId).docAttrib.workerList
    console.log(this.workers)

    if(this.localEvent.length > 0)
      this.currentEventName = this.localEvent[0].eventName
  }

  close() {
    this.dialogRef.close()
  }

  saveAndClose() {
    if(!this.currentMaket.docAttrib.documentEventList)
      this.currentMaket.docAttrib.documentEventList = []
    this.currentMaket.docAttrib.documentEventList.splice(0, this.currentMaket.docAttrib.documentEventList.length)
    this.currentMaket.docAttrib.documentEventList.push(...this.localEvent)
    this.dialogRef.close(1)
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

  selectTab() {
    let wrapper = document.getElementsByClassName('mat-mdc-tab-body-wrapper')
    if(wrapper) {
      wrapper[0].setAttribute("style","height:100%")
    }
  }

  clearAllEvent() {
    this.localEvent.splice(0,this.localEvent.length)
    this.setEventWorkerList(this.currentEventName)
  }


}
