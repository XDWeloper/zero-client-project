import {ComponentMaket, IceDocument, IceDocumentMaket, IceStepMaket} from "../interfaces/interfaces";
import {ObjectEditedFields, ObjectField} from "../constants";

export type WorkerType = "FIELDCHANGER" | undefined
export type Position = {x: number, y: number}
export type Method = "GET" | "POST" | "PUT" | "DELETE" | "PUTCH"
export type ActionObjectType = "DOCUMENT" | "PAGE" | "COMPONENT"

export interface IAction {
  objectType: ActionObjectType
  objectName: string
  objectId: number
  order?: number | undefined;
  componentFieldActionList?:{
    fieldName: string
    fieldSet: {
      object: any
      string: any
    }
    isAutoFill: boolean
    isDisabledAfterFill: boolean
  }[]
}


export class Action implements IAction{
  order?: number | undefined
  componentFieldActionList: { fieldName: string; fieldSet: {object: string, string: string} | any, isAutoFill: boolean,isDisabledAfterFill: boolean}[];
  objectId: number;
  objectName: string;
  objectType: ActionObjectType;

  static duilder(action: IAction): Action{
    let newAction = new Action()
    newAction.objectId = action.objectId
    newAction.objectName = action.objectName
    newAction.objectType = action.objectType
    return newAction
  }
}

export interface ConditionType{
  argument1: string
  relation: "=" | "!=" | ">" | "<"
  argument2: string
}
export interface IActionGroup {
  name: string
  conditions?: ConditionType[]
  action?: Action[]
}

export class ActionGroup implements IActionGroup{
  action: Action[];
  conditions: ConditionType[];
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}


export interface IWorker {
  id: number
  name: string
  event?: string
  type: WorkerType,
  dataSourceId?: number
  position: Position
  order?: number
  actionGroupList?:IActionGroup[]
}

export class IceWorker implements IWorker{
  id: number
  name: string
  event?: string
  type: WorkerType
  dataSourceId?: number
  position: Position
  order?: number
  actionGroupList?:IActionGroup[]

  runWorker(value?: any, currentDocument?: IceDocument): void {
  }
}



export interface IDataSource {
  id: number
  name: string
  event?: string
  url?: string
  method?: Method
  pathVariables?: IVariablesMap[]
  bodyVariables?: IVariablesMap[]
  dynamicPathVariables?: IVariablesMap[]
  dynamicBodyVariables?: IVariablesMap[]
  isNativeSource?: boolean
  position:Position
}

export interface IVariablesMap {
  key: string,
  value: any,
  realValue?: any,
  isAutoFill: boolean
}

//relation?: { sourcePath: string, receiverComponentName: string }[]
