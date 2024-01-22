
export abstract class Worker {
  runWorker(): void{}
}

export interface IWorker{
  id: number
  name: string
  event?: string

}

export interface IIceDataSource extends IWorker{
  url?: string
  method?: string
  pathVariables?: IVariablesMap[]
  bodyVariables?: IVariablesMap[]
  relation?: {sourcePath: string, receiverComponentName: string}[]
}

export interface IVariablesMap {
  key:string,
  value:any,
  isAutoFill: boolean
}


export class IceDataSource extends Worker implements IIceDataSource{
  id: number
  name: string
  url?: string
  method?: string
  pathVariables?: IVariablesMap[]
  bodyVariables?: IVariablesMap[]
  relation?: {sourcePath: string, receiverComponentName: string}[]
  event?: string

  getPathVariablesString(): string{
    let result=""
      this.pathVariables.map((value, index) => `${index ===0 ? '?': '&'} ${value.key}=${value.value}`).forEach(value => result += value)
    return result
  }

  override runWorker() {
    super.runWorker();
  }


}


