import {IceDocument} from "../interfaces/interfaces";

export type WorkerType = "NETDATASOURCE" | "FIELDCHANGER"

export abstract class IceWorker {
  id: number
  name: string
  event?: string
  type: WorkerType

  runWorker(value?: any, currentDocument?: IceDocument): void {
  }
}

export interface IWorker {
  id: number
  name: string
  event?: string
  type: WorkerType

  runWorker(value?: any, currentDocument?: IceDocument): void
}

export type Method = "GET" | "POST" | "PUT" | "DELETE" | "PUTCH"

export interface IDataSource extends IWorker{
  url?: string
  method?: Method
  pathVariables?: IVariablesMap[]
  bodyVariables?: IVariablesMap[]
  relation?: { sourcePath: string, receiverComponentName: string }[]
  isNativeSource?: boolean
}

export interface IVariablesMap {
  key: string,
  value: any,
  realValue?: any,
  isAutoFill: boolean
}

export interface IFieldChanger extends IWorker {
}
