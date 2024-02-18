import { Injectable } from '@angular/core';
import {IceDataSourceWorker } from "../workers/IceDataSourceWorker";
import {DataSourceService} from "./data-source.service";
import {IceDocument} from "../interfaces/interfaces";
import {IDataSource, IWorker} from "../workers/workerModel";
import {FieldChangerWorker} from "../workers/FiedChangerWorker";


@Injectable({
  providedIn: 'root'
})
export class WorkerService {

  workerList: IWorker[] = []

  constructor(private dataSourceService: DataSourceService) { }

  createWorker(currentDocument: IceDocument){
    let workerDataList: IWorker[] = currentDocument.docAttrib.workerList
    this.workerList.splice(0, this.workerList.length)
    workerDataList.forEach((worker : IDataSource) => {
      let newWorker: IWorker =
      worker.type === "NETDATASOURCE"  ?
        new IceDataSourceWorker(
        worker.id,
        worker.name,
        worker.type,
        worker.url,
        worker.method,
        worker.pathVariables,
        worker.bodyVariables,
        worker.relation,
        worker.event,
        worker.isNativeSource,
        this.dataSourceService) :
      new FieldChangerWorker(worker.id,worker.name, worker.type)

      this.workerList.push(newWorker)
    })
  }

  startWorkers(workerIdList: number[], componentValue?: any, currentDocument?: IceDocument){
    this.workerList.filter(value => workerIdList.includes(value.id)).forEach(value => value.runWorker(componentValue,currentDocument))
  }

}
