import {environment} from "../../environments/environment";

export abstract class Worker {
  runWorker(): void{}
}

export interface IWorker{
  id: number
  name: string
  event?: string

}

export type Method = "GET" | "POST" | "PUT" | "DELETE" | "PUTCH"

export interface IDataSource extends IWorker{
  url?: string
  method?: Method
  pathVariables?: IVariablesMap[]
  bodyVariables?: IVariablesMap[]
  relation?: {sourcePath: string, receiverComponentName: string}[]
  isNativeSource?: boolean
}

export interface IVariablesMap {
  key:string,
  value:any,
  isAutoFill: boolean
}


export class IceDataSource extends Worker implements IDataSource{
  id: number
  name: string
  url?: string
  method?: Method
  pathVariables?: IVariablesMap[]
  bodyVariables?: IVariablesMap[]
  relation?: {sourcePath: string, receiverComponentName: string}[]
  event?: string
  isNativeSource?: boolean


  constructor(id: number, name: string, url?: string, method?: Method, pathVariables?: IVariablesMap[], bodyVariables?: IVariablesMap[], relation?: {
    sourcePath: string;
    receiverComponentName: string
  }[], event?: string, isNativeSource?: boolean) {
    super();
    let isN = isNativeSource === undefined ? true: isNativeSource;
    this.id = id;
    this.name = name;
    this.url = url ? url : isN ? environment.resourceServerURL: "https://";
    this.method = "GET";
    this.pathVariables = pathVariables;
    this.bodyVariables = bodyVariables;
    this.relation = relation;
    this.event = event;
    this.isNativeSource = isN
  }




  getPathVariablesString(): string{
    let result=""
    if(!this.pathVariables)
      return ""

      this.pathVariables.map(value => `&${value.key}=${value.value}`).forEach(value => result += value)
    return `?${result}`
  }

  override runWorker() {
    super.runWorker();
  }


}


