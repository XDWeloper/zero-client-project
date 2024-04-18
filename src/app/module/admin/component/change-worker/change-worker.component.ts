import {ChangeDetectionStrategy, Component, forwardRef, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EventNameTitle} from "../../../../services/event.service";
import {IWorker} from "../../../../workers/workerModel";
import {IceEvent} from "../../../../interfaces/interfaces";
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from "@angular/forms";
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem
} from "@angular/cdk/drag-drop";
import {MatIconModule} from "@angular/material/icon";

@Component({
  selector: 'app-change-worker',
  standalone: true,
  imports: [CommonModule, FormsModule, CdkDropListGroup, CdkDropList, CdkDrag, MatIconModule],
  templateUrl: './change-worker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ChangeWorkerComponent),
    multi: true
  }]
})
export class ChangeWorkerComponent implements OnInit, ControlValueAccessor
{
  @Input() eventList: EventNameTitle[]
  @Input() allWorkerList: IWorker[]
  private _workerList: IceEvent[]
  private _currentEventName: EventNameTitle = null;
  eventWorkerList: IWorker[] = []
  currentAllWorkerList: IWorker[] = []

  ngOnInit(): void {
  }


  get currentEventName(): EventNameTitle {
    return this._currentEventName;
  }

  set currentEventName(value: EventNameTitle) {
    this._currentEventName = value;
    this.setWorkerList()
  }

  setWorkerList() {
    this.eventWorkerList.splice(0,this.eventWorkerList.length)
    if(this.workerList && this.workerList.length > 0){
      let currentWl = this.workerList.find(wl => wl.eventName === this.currentEventName.eventName)
      if (currentWl) {
        this.eventWorkerList.push(...this.allWorkerList.filter(w => currentWl.workerIdList.map(item => item.id).includes(w.id))
          .sort((a, b) => a.order - b.order))
      }
    }
    this.currentAllWorkerList.splice(0,this.currentAllWorkerList.length)
    this.currentAllWorkerList = this.allWorkerList.filter(item => !this.eventWorkerList.map(item => item.id).includes(item.id))
  }

  get workerList() {
    return this._workerList;
  }

  set workerList(value) {
    if (value != this._workerList) {
      this._workerList = value;
      this.onChange(value)
    }
  }

  onChange(_: any) {
  }

  onTouch() {
  }

  writeValue(obj: IceEvent[]): void {
    this._workerList = obj
  }

  registerOnChange(fn: any): void {
    this.onChange = fn
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn
  }


  dragged(event: CdkDragDrop<IWorker[]>) {

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.reOrdering(event,"move");
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      this.reOrdering(event);
      let iceEvent = this.workerList.find(wl => wl.eventName === this.currentEventName.eventName)
      if(!iceEvent)
        this.workerList.push({
          eventName: this.currentEventName.eventName,
          workerIdList: [{id: event.container.data[event.currentIndex].id, order: event.container.data[event.currentIndex].order}]
        })
      else{
        iceEvent.workerIdList.splice(0,iceEvent.workerIdList.length)
        iceEvent.workerIdList.push(...this.eventWorkerList.map(item => {
          return {id:item.id,order:item.order}
        }))
      }
      this.reOrdering(event);
    }
  }

  private reOrdering(event: CdkDragDrop<IWorker[]>, type?: string) {
    /**Переупорядочить ордера*/
//    if(type === "move")
      event.container.data.forEach((item, index) => {item.order = index})
    // else {
    //   event.previousContainer.data.forEach((item, index) => {item.order = index})
    //   event.container.data.forEach((item, index) => {item.order = undefined})
    // }
  }
}
