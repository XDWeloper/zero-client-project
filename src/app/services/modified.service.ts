import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ModifiedService {

  modify$ = new BehaviorSubject(false);
  private _isModified = false

  constructor() { }

  saveModify(){
    this.modify$.next(true)

  }

  setModified(val: boolean){
    this._isModified = val
  }

  getModified(): boolean{
    return this._isModified
  }
}
