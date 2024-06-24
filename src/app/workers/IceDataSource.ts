import {environment} from "../../environments/environment";
import {ComponentMaket, IceDocument} from "../interfaces/interfaces";
import {IDataSource, IVariablesMap, Method, Position} from "./workerModel";

export class IceDataSource implements IDataSource {
  id: number;
  name: string;
  event?: string;
  url?: string
  method?: Method

  pathVariables?: IVariablesMap[]
  bodyVariables?: IVariablesMap[]
  dynamicPathVariables?: IVariablesMap[] = []
  dynamicBodyVariables?: IVariablesMap[] = []

  isNativeSource?: boolean
  position: Position


  constructor(id: number, name: string, url?: string, method?: Method, pathVariables?: IVariablesMap[], bodyVariables?: IVariablesMap[],
              event?: string, isNativeSource?: boolean, position?: Position, dynamicPathVariables?: IVariablesMap[], dynamicBodyVariables?: IVariablesMap[]) {
    let isN = isNativeSource === undefined ? true : isNativeSource;
    this.id = id;
    this.name = name;
    this.url = url ? url : isN ? environment.resourceServerURL : "https://";
    this.method = "GET";
    this.pathVariables = pathVariables;
    this.bodyVariables = bodyVariables;
    this.event = event;
    this.isNativeSource = isN
    this.position = position
    this.dynamicPathVariables = dynamicPathVariables
    this.dynamicBodyVariables = dynamicBodyVariables

  }

  static builder(dataSource: IDataSource): IceDataSource {
    return new IceDataSource(
      dataSource.id,
      dataSource.name,
      dataSource.url,
      dataSource.method,
      dataSource.pathVariables,
      dataSource.bodyVariables,
      dataSource.event,
      dataSource.isNativeSource,
      dataSource.position,
      dataSource.dynamicPathVariables,
      dataSource.dynamicBodyVariables
    )
  }

  getPathVariablesString(currentDocument?: IceDocument): string {

    let result = ""
    if (!this.pathVariables)
      return ""
    /**Если получаем данные запроса динамически нужно их подставить*/
    this.pathVariables.forEach(varMap => {
      if (varMap.isAutoFill && varMap.value && varMap.key) {
        if (this.dynamicPathVariables && this.dynamicPathVariables.length > 0) {
          varMap.realValue = this.dynamicPathVariables.find(item => item.key === varMap.key).value
        } else {
          let componentName = varMap.value.toString().replace("[", "").replace("]", "")
          varMap.realValue = this.getComponentFromName(currentDocument, componentName).value
        }
      } else
        varMap.realValue = varMap.value

    })

    this.pathVariables.map(value => `&${value.key}=${value.realValue}`).forEach(value => result += value)
    if (result.length === 0)
      return ""

    /**Очистить тестовые переменные*/
    this.pathVariables.map(value => value.realValue).fill(undefined)

    return `?${result.slice(1, result.length)}`
  }

  getComponentFromName(currentDocument: IceDocument, componentName: String): ComponentMaket | undefined {
    return currentDocument.docStep
      .map(v => v.componentMaket)
      .flat()
      .find(v1 => v1.componentName === componentName)
  }
}


