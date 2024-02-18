import {IceDocument} from "../interfaces/interfaces";
import {IceWorker, IFieldChanger, IWorker, WorkerType} from "./workerModel";

export class FieldChangerWorker extends IceWorker implements IFieldChanger{

  constructor(id: number, name: string,type: WorkerType) {
    super();
  }


  override runWorker(value?: any, currentDocument?: IceDocument) {
  }
}


