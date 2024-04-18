import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from "@angular/material/icon";
import {MatDialogRef} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {IceMaketComponent} from "../../classes/icecomponentmaket";
import {IceEvent} from "../../../../interfaces/interfaces";
import {EventNameTitle, EventService} from "../../../../services/event.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DocumentService} from "../../../../services/document.service";
import {ChangeWorkerComponent} from "../change-worker/change-worker.component";
import {IWorker} from "../../../../workers/workerModel";

interface LocalWorker {workerName: string, workerId: number}

@Component({
  selector: 'app-event-control-prop',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, ReactiveFormsModule, FormsModule, ChangeWorkerComponent],
  templateUrl: './event-control-prop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventControlPropComponent {
  localEvent: IceEvent[] = []
  currentComponent: IceMaketComponent
  currentDocId: number
  eventList: EventNameTitle[] = []
  workerList: IWorker[]

  constructor(
    public dialogRef: MatDialogRef<EventControlPropComponent>,
    protected eventService: EventService,
    protected documentService: DocumentService) {
  }


  init() {
    this.eventList = this.eventService.getEventNameAndTitleList('COMPONENT')
    this.localEvent.push(...(this.currentComponent.componentEvent ?? []))
    this.workerList = this.documentService.getTemplateByDocId(this.currentDocId).docAttrib.workerList
  }

    close() {
    this.dialogRef.close()
  }

  saveAndClose() {
    if(!this.currentComponent.componentEvent)
      this.currentComponent.componentEvent = []
    this.currentComponent.componentEvent.splice(0, this.currentComponent.componentEvent.length)
    this.currentComponent.componentEvent.push(...this.localEvent)

    console.log("",this.currentComponent.componentEvent)

    this.dialogRef.close()
  }


  clearAllEvent() {
    this.localEvent.splice(0,this.localEvent.length)
  }
}
