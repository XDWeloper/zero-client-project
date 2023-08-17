import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class StepService {

  disabledAllStep$ = new Subject<boolean>()

  constructor() { }

  disabledAllStep(disabled: boolean){
    this.disabledAllStep$.next(disabled)
  }

}
