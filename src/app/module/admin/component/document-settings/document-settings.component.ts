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
import {ChangeWorkerComponent} from "../change-worker/change-worker.component";

interface LocalWorker {workerName: string, workerId: number}

@Component({
  selector: 'app-document-settings',
  standalone: true,
  imports: [CommonModule, DataSourceFilterPipe, IceInputComponent, MatIconModule, MatSlideToggleModule, MatTabsModule, MatTooltipModule, ReactiveFormsModule, FormsModule, ChangeWorkerComponent],
  templateUrl: './document-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentSettingsComponent implements OnInit{

  localEvent: IceEvent[] = []
  workerList: IWorker[];
  eventList:EventNameTitle[] = []
  currentMaket: IceDocumentMaket

  constructor(public dialogRef: MatDialogRef<DocumentSettingsComponent>, protected eventService: EventService, private documentService: DocumentService) {
  }

  ngOnInit() {
    this.eventList = this.eventService.getEventNameAndTitleList('DOCUMENT')
    this.localEvent.push(...(this.currentMaket.docAttrib.documentEventList ?? []))
    this.workerList = this.documentService.getTemplateByDocId(this.currentMaket.docId).docAttrib.workerList
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

  selectTab() {
    let wrapper = document.getElementsByClassName('mat-mdc-tab-body-wrapper')
    if(wrapper) {
      wrapper[0].setAttribute("style","height:100%")
    }
  }

}
