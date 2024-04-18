import {Injectable} from '@angular/core';
import {DataSourceService} from "./data-source.service";
import {IceDocument, IceEvent} from "../interfaces/interfaces";
import {IceWorker, IWorker} from "../workers/workerModel";
import {FieldWorker} from "../workers/FiedChangerWorker";
import {EventService} from "./event.service";
import {BehaviorSubject, Subject} from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class WorkerService {

  workerList: IceWorker[] = []
  startedWorkerList: IceWorker[] = []
  workerListStartedIndex = 0

  isWorkerStarted$ = new BehaviorSubject<boolean>(false)

  static instance: WorkerService


  constructor() {
    if(!WorkerService.instance)
      WorkerService.instance = this
  }

  createWorker(currentDocument: IceDocument) {
    let workerMetaDataList: IWorker[] = currentDocument.docAttrib.workerList
    this.workerList.splice(0, this.workerList.length)
    workerMetaDataList.forEach((worker: IWorker) => {
      this.workerList.push(
        new FieldWorker(
          worker.id,
          worker.name,
          worker.type,
          worker.dataSourceId,
          worker.order,
          worker.actionGroupList)
      )
    })
  }

  startWorkers(workerIdList: {id: number, order: number}[], componentValue?: any, currentDocument?: IceDocument) {
  //startWorkers(workerIdList: {id: number, order: number}[], componentValue?: any, currentDocument?: IceDocument) {
    this.startedWorkerList.splice(0,this.startedWorkerList.length)
    this.startedWorkerList.push(...this.workerList.filter(value => workerIdList.map(item => item.id).includes(value.id))
      .sort((a,b) => a.order - b.order) )

    this.workerListStartedIndex = 0

    this.isWorkerStarted$.subscribe(value => {

      if(!value && this.workerListStartedIndex < this.startedWorkerList.length){
        this.startedWorkerList[this.workerListStartedIndex ++].runWorker(componentValue, currentDocument)
        EventService.instance.isWorkerResize = true
        console.log("event resize")
      }
    })

  }

}
