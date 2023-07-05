import {Component, OnDestroy, OnInit, Output} from '@angular/core';
import {MessageService} from "../../services/message.service";
import {Subject, Subscription} from "rxjs";
import {DialogButtonType, MessageDialog} from "../../interfaces/interfaces";

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
})
export class MessageDialogComponent implements OnInit, OnDestroy{

  message: MessageDialog
  errorSubj$: Subscription
  isShow: boolean = false

  constructor(private messageService: MessageService) {
  }


  ngOnDestroy(): void {
    this.errorSubj$.unsubscribe()
  }

  ngOnInit(): void {
    this.errorSubj$ = this.messageService.getMessage().subscribe(message => {
      this.message = message
      if(this.message.dialogButtonsType === undefined) {
        this.message.dialogButtonsType = []
        this.message.dialogButtonsType.push("CLOSE")
      }
      this.isShow = true
    })
  }

  close(buttonClick: DialogButtonType) {
    this.isShow = false
    this.messageService.closeDialog(buttonClick)
  }

  findButton(type: string): boolean {
    return this.message.dialogButtonsType.find(p => p === type) != undefined
  }
}
