import {environment} from "../../environments/environment";
import {DataSourceMap, DataSourceService} from "../services/data-source.service";
import {ComponentMaket, IceDocument} from "../interfaces/interfaces";
import {IceComponentType} from "../constants";
import {IceWorker, IDataSource, IVariablesMap, Method, WorkerType} from "./workerModel";

export class IceDataSourceWorker extends IceWorker implements IDataSource {
  url?: string
  method?: Method
  pathVariables?: IVariablesMap[]
  bodyVariables?: IVariablesMap[]
  relation?: { sourcePath: string, receiverComponentName: string }[]
  isNativeSource?: boolean
  dataSourceService: DataSourceService


  constructor(id: number, name: string, type: WorkerType,url?: string, method?: Method, pathVariables?: IVariablesMap[], bodyVariables?: IVariablesMap[], relation?: {
    sourcePath: string;
    receiverComponentName: string
  }[], event?: string, isNativeSource?: boolean, dataSourceService?: DataSourceService) {
    super();
    let isN = isNativeSource === undefined ? true : isNativeSource;
    this.id = id;
    this.name = name;
    this.url = url ? url : isN ? environment.resourceServerURL : "https://";
    this.method = "GET";
    this.pathVariables = pathVariables;
    this.bodyVariables = bodyVariables;
    this.relation = relation;
    this.event = event;
    this.isNativeSource = isN
    this.dataSourceService = dataSourceService
    this.type = type
  }

  getPathVariablesString(currentDocument?: IceDocument): string {
    let result = ""
    if (!this.pathVariables)
      return ""
    /**Если получаем данные запроса динамически нужно их подставить*/
    this.pathVariables.forEach(varMap => {
      if (varMap.isAutoFill) {
        let componentName = varMap.value.toString().replace("[", "").replace("]", "")
        varMap.realValue = this.getComponentFromName(currentDocument, componentName).value
      } else
        varMap.realValue = varMap.value

    })
    this.pathVariables.map(value => `&${value.key}=${value.realValue}`).forEach(value => result += value)
    return `?${result.slice(1, result.length)}`
  }

  override runWorker(value?: any, currentDocument?: IceDocument) {
    if (!this.dataSourceService) return
    console.log("run worker name:" + this.name + "    value = " + value)

    this.dataSourceService.getData(this, currentDocument).subscribe({
      next: (res => {

        this.relation.forEach(rel => {
          let allValue = res.filter(v => v.key === rel.sourcePath)
          let receiverComponent = this.getComponentFromName(currentDocument, rel.receiverComponentName)
          switch (receiverComponent.componentType) {
            case IceComponentType.SELECT:
              this.fillSelectComponent(receiverComponent, allValue)
              break;
            case IceComponentType.INPUT:
            case IceComponentType.TEXT:
            case IceComponentType.AREA :
              this.fillTextComponent(receiverComponent, allValue)
              break;
          }
        })
        window.dispatchEvent(new Event('resize'))
      }),
      error: (error => console.log(error)),
    })
  }

  getComponentFromName(currentDocument: IceDocument, componentName: String): ComponentMaket {
    return currentDocument.docStep
      .map(v => v.componentMaket)
      .flat()
      .find(v1 => v1.componentName === componentName)
  }

  fillSelectComponent(component: ComponentMaket, val: DataSourceMap[]) {
    if (val.length === 1) {
      component.optionList.push(val[0].value)
      this.fillTextComponent(component, val)
    }
    else
      component.optionList = val.map(ds => ds.value)
  }

  fillTextComponent(component: ComponentMaket, val: DataSourceMap[]) {
    component.value = val.map(ds => ds.value)[0]
  }
}


