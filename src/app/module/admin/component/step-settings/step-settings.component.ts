import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from "@angular/material/icon";
import {MatTabsModule} from "@angular/material/tabs";
import {MatDialogRef} from "@angular/material/dialog";
import {ChangeWorkerComponent} from "../change-worker/change-worker.component";
import {IceDocumentMaket, IceEvent, IceStepMaket} from "../../../../interfaces/interfaces";
import {IWorker} from "../../../../workers/workerModel";
import {EventNameTitle, EventService} from "../../../../services/event.service";
import {DocumentService} from "../../../../services/document.service";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-step-settings',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTabsModule, ChangeWorkerComponent, FormsModule],
  templateUrl: './step-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepSettingsComponent implements OnInit{
  localEvent: IceEvent[] = []
  workerList: IWorker[];
  eventList:EventNameTitle[] = []
  currentStep: IceStepMaket


  constructor(public dialogRef: MatDialogRef<StepSettingsComponent>, protected eventService: EventService, private documentService: DocumentService) {
  }


  ngOnInit(): void {
    this.eventList = this.eventService.getEventNameAndTitleList("STEP")
    this.localEvent.push(...(this.currentStep.stepEvent ?? []))
    //this.workerList = this.documentService.getTemplateByDocId(this.currentStep.docId).docAttrib.workerList

  }

  SaveAndClose() {
    if(!this.currentStep.stepEvent)
      this.currentStep.stepEvent = []

    this.currentStep.stepEvent.splice(0, this.currentStep.stepEvent.length)
    this.currentStep.stepEvent.push(... this.localEvent)
    this.dialogRef.close(1)

  }

  selectTab() {
    let wrapper = document.getElementsByClassName('mat-mdc-tab-body-wrapper')
    if(wrapper) {
      wrapper[0].setAttribute("style","height:100%")
    }
  }
}
