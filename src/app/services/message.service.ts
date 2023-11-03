import { Injectable } from '@angular/core';
import {AsyncSubject, BehaviorSubject, ReplaySubject, Subject} from "rxjs";
import {DialogButtonType, DialogType, MessageDialog} from "../interfaces/interfaces";

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private message = new Subject <MessageDialog>()
  private onClose = new Subject<DialogButtonType>()

  constructor() { }

  show(message: string, hideMessage: string, type: DialogType,buttonList?: DialogButtonType[]): Subject<DialogButtonType>{
    this.message.next({message: message,hideMessage: hideMessage,dialogType: type, dialogButtonsType: buttonList})
    return this.onClose
  }

  getMessage(): Subject<MessageDialog>{
    return this.message
  }

  closeDialog(buttonType: DialogButtonType){
    this.onClose.next(buttonType)
    this.onClose.complete()
    this.onClose.unsubscribe()
    this.onClose = new Subject<DialogButtonType>()
  }
}
