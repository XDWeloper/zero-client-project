import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TabService {

  private openTab$ = new Subject<number>()

  constructor() { }

  onTabChanged(): Subject<number>{
    return this.openTab$
  }

  openTab(tabNum: number){
    this.openTab$.next(tabNum)
  }

}
