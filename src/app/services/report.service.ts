import {inject, Injectable, OnDestroy} from '@angular/core';
import {ERROR, INFO, MESSAGE_REPORT_IN_PROCESS, MESSAGE_REPORT_IS_DONE} from "../constants";
import {interval, Subject, Subscription} from "rxjs";
import {BackendService} from "./backend.service";
import {MessageService} from "./message.service";
import {TimeService} from "./time.service";

@Injectable({
  providedIn: 'root'
})
export class ReportService implements OnDestroy{
  private backService = inject(BackendService)
  private messageService = inject(MessageService)
  private timeService = inject(TimeService)

  private   savedIsDone$ =   new Subject<boolean>()
  private reportInterval$: Subscription;
  private reportId: number | undefined = undefined
  private docId: number;
  private reportProcessUID: string;




  constructor() {
  }

  print(reportId : number, docId: number) {
    this.reportId = reportId
    this.docId = docId

    if(this.reportId){
      this.backService.createReport(this.reportId, "PDF", [this.docId]).subscribe({
          next: value => {
            if (value.status === "ERROR") {
              this.messageService.show(value.message, value.message, ERROR)
            }

            console.log("report is create!!")
            if (value.status === "DONE" && value.reportFile.length > 0) {
              window.open("assets/report/" + value.reportFile, "_blank");
            }
            if (value.status === "PROCESS" && value.uuid.length > 0) {
              this.reportProcessUID = value.uuid
              this.messageService.show(MESSAGE_REPORT_IN_PROCESS, "", INFO).subscribe({
                next: value1 => {
                  this.startReportTimer()
                }
              })
            }

          },
          error: err => {
            console.log(err)
            this.messageService.show(err.error.message,err.error.error, ERROR)
          }
        }
      )
    }

  }

  startReportTimer() {
    this.reportInterval$ = interval(5000).subscribe(() => {
      if (this.reportProcessUID) {
        this.timeService.isBlocked = true
        this.backService.getReportStatus(this.reportProcessUID).subscribe({
          next: value => {
            if (value.status === "ERROR") {
              this.reportProcessUID = undefined
              this.reportInterval$.unsubscribe()
              this.messageService.show(value.message, value.message, ERROR)
            }
            if (value.status === "DONE" && value.reportFile.length > 0) {
              this.reportProcessUID = undefined
              this.reportInterval$.unsubscribe()
              this.messageService.show(MESSAGE_REPORT_IS_DONE, "", INFO,["YES","NO"]).subscribe({
                next: button => {
                  if (button === "YES") {
                    window.open("assets/report/" + value.reportFile, "_blank");
                  }
                }
              })

            }
            if (value.status === "PROCESS" && value.uuid.length > 0) {
              console.log(value)
            }
          },
          error: err => {
            this.messageService.show(err, err, ERROR)
          },
          complete: () => {
            this.timeService.isBlocked = false
          }
        })
      }
    })

  }


  ngOnDestroy(): void {
        if(this.savedIsDone$)
          this.savedIsDone$.unsubscribe()
        if(this.reportInterval$)
          this.reportInterval$.unsubscribe()
    }
}
