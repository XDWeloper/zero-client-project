import {
  ComponentMaket,
  DialogType,
  EventObject,
  IceDocument,
  IceStepMaket,
  PlaceObject
} from "../interfaces/interfaces";
import {Action, ActionObjectType, IActionGroup, IceWorker, WorkerType} from "./workerModel";
import {DataSourceMap, DataSourceService} from "../services/data-source.service";
import {MessageService} from "../services/message.service";
import {IceComponentType, REQUEST_TEST_ERROR} from "../constants";
import {DocumentEditorComponent} from "../module/client/component/document-editor/document-editor.component";
import {EventService} from "../services/event.service";
import {WorkerService} from "../services/worker.service";
import {computeStartOfLinePositions} from "@angular/compiler-cli/src/ngtsc/sourcemaps/src/source_file";

export class FieldWorker extends IceWorker {

  localDataSourceMap: DataSourceMap[] = []
  localCurrentDocument: IceDocument | undefined = undefined
  localValue: any | undefined = undefined

  tmpFieldDisabled: boolean| undefined = undefined

  constructor(id: number, name: string, type: WorkerType, dataSourceId?: number, order?: number, actionGroupList?: IActionGroup[]) {
    super();
    this.id = id
    this.name = name
    this.type = type
    this.dataSourceId = dataSourceId
    this.order = order
    this.actionGroupList = actionGroupList
  }


  override runWorker(value?: any, currentDocument?: IceDocument) {
    console.log("run worker name:" + this.name + "   id = " +  this.id)
    WorkerService.instance.isWorkerStarted$.next(true)
    if(DocumentEditorComponent.instance.currentDocument)
      this.localCurrentDocument = DocumentEditorComponent.instance.currentDocument
    else
      return;

    this.localValue = value

    /**проверить наличие групп обработки*/
    if (!(this.actionGroupList && this.actionGroupList.length > 0))
      return;


    let ds = DataSourceService.instance.getDataSourceById(this.dataSourceId ?? -1)
    if (!ds) {
      /**Запуск воркера без источника*/
      this.startWorker()
      return;
    }

    if (this.localDataSourceMap.length > 0) {
      this.startWorker()
      return;
    }
    DataSourceService.instance.getDataMapValue(ds, currentDocument).subscribe({
      next: (res => {
        if (res && res.length > 0) {
          this.localDataSourceMap.push(...res)
          this.startWorker()
        }
      }),
      error: (error => {
        WorkerService.instance.isWorkerStarted$.next(false)
        console.log(error)
        let messageType:DialogType = error.error.status === 500 ? "ERROR" : "INFO"
        MessageService.instance.show(`${error.error.message}`, error.error.message, messageType)
      }),
    })

  }

  startWorker() {

    console.log("startWorker()")
    this.actionGroupList.forEach(actionGroup => {
      this.runActionGroup(actionGroup)
    })
    //console.log("dispatchEvent")
    //window.dispatchEvent(new Event('resize'))

    DocumentEditorComponent.instance.currentDocument = {...this.localCurrentDocument}
    window.dispatchEvent(new Event('resize'))
    console.log("worker  " + this.name + "  is finished  "  +  this.id)
    //console.log("localCurrentDocument", {...this.localCurrentDocument})
    WorkerService.instance.isWorkerStarted$.next(false)

  }

  private runActionGroup(actionGroup: IActionGroup) {

    if (!this.checkCondition(actionGroup))
      return
    console.log("-------- runAction!!!!!!!!!!!!!!")
    if(actionGroup.action)
    actionGroup.action.forEach(action => {
      this.runAction(action)
    })
  }

  /**Запускаем саму активность*/
  private runAction(action: Action) {
    if (!action.componentFieldActionList.find(item => item.fieldSet != undefined))
      return

    let object: ComponentMaket | IceDocument | IceStepMaket | undefined = undefined
    switch (action.objectType) {
      case "COMPONENT":
        object = this.localCurrentDocument.docStep.map(item => item.componentMaket).flat().find(item => item.componentID === action.objectId)
        break;
      case "DOCUMENT":
        object = this.localCurrentDocument
        break;
      case "PAGE":
        object = this.localCurrentDocument.docStep.find(item => item.stepNum === action.objectId)
    }

    if (object) {
      this.tmpFieldDisabled = undefined
      /**Если смогли идентифицировать объект корректировки*/
      action.componentFieldActionList.forEach(fieldAction => {
        if (fieldAction.fieldSet != undefined) {
          /**Если что-то установлено*/
          this.runFieldSet(fieldAction, object, action.objectType)
        }
      })
    }
  }

  private runFieldSet(fieldAction: {
                        fieldName: string; fieldSet: { object: string, string: string } | any,
                        isAutoFill: boolean,isDisabledAfterFill: boolean
                      },
                      object: ComponentMaket | IceDocument | IceStepMaket, objectType: ActionObjectType) {

    /**Получить данные для вставки*/
    let value: any
    if (fieldAction.isAutoFill) {
      value = this.getFromDataMap(fieldAction.fieldSet)
      if(fieldAction.isDisabledAfterFill && value){
        this.tmpFieldDisabled = true
      }
    }
    else
      value = fieldAction.fieldSet

    /**Нужно трансформировать значение в соответствии с типом объекта*/

    if (objectType === 'COMPONENT' && (
        (object as ComponentMaket).componentType === IceComponentType.INPUT
        || (object as ComponentMaket).componentType === IceComponentType.AREA
        || (object as ComponentMaket).componentType === IceComponentType.PLACE
      ) && fieldAction.fieldName === "value"
    ) {/**Это простой инпут или область*/
    this.setSimpleValueInputOrAreaOrPlace(value, object, fieldAction);
      return
    }

    if (objectType === 'COMPONENT'
      && (object as ComponentMaket).componentType === IceComponentType.TABLE
      && fieldAction.fieldName === "value") {
      /**нужно установить набор значений для таблицы*/
      this.setValueForTable(value, object, fieldAction);
      return;
    }


    if (objectType === 'COMPONENT'
      && (object as ComponentMaket).componentType === IceComponentType.SELECT
      && fieldAction.fieldName === "value") {/**нужно установить значение для селлекта*/
      this.setValueToOptionListOfSelect(value, {...fieldAction,fieldName:"optionList"}, object)//записали в лист
      this.setValueToOptionListOfSelect(value, fieldAction, object)//записали в значение
      return
    }

    if (objectType === 'COMPONENT'
      && (object as ComponentMaket).componentType === IceComponentType.SELECT
      && fieldAction.fieldName === "optionList") {
      /**нужно установить набор значений для селекта*/
      this.setValueToOptionListOfSelect(value, fieldAction, object)
      return;
    }


    /**Если значение оказалось пустым нужно отменить деактивацию поля*/
    if (objectType === 'COMPONENT' && fieldAction.fieldName === "enabled" && this.tmpFieldDisabled){
      value = false
    }

    //console.log(fieldAction.fieldName, object, value)
    this.enabledAndSetFieldValue(fieldAction.fieldName, object, value)
  }

  private setSimpleValueInputOrAreaOrPlace(value: any, object: ComponentMaket | IceDocument | IceStepMaket, fieldAction: {
    fieldName: string;
    fieldSet: any;
    isAutoFill: boolean;
    isDisabledAfterFill: boolean
  }) {
    if(Array.isArray(value) && value.length < 1) {
      return
    }

    if (Array.isArray(value) && value.length > 0)
      value = value[0]

    this.enabledAndSetFieldValue("dataObject", object, (value as DataSourceMap).value)

    let visualValue = value

    //console.log("value", value)

    if ((typeof value) === "object") {
      let keyName = fieldAction.fieldSet.string.substring(2, fieldAction.fieldSet.string.length - 1)
      if ((typeof (value as DataSourceMap).value) === "object")
        visualValue = Object.values((value as DataSourceMap).value)[Object.keys((value as DataSourceMap).value).findIndex(item => item == keyName)]
      else
        visualValue = (value as DataSourceMap).value
    }

    if ((object as ComponentMaket).componentType === IceComponentType.PLACE) {
      if (fieldAction.isDisabledAfterFill && visualValue === undefined)
        this.tmpFieldDisabled = false
      visualValue = {placeList: {}, placeString: visualValue ? visualValue.replaceAll("\\", "") : "Данные не найдены"}
    }

    if((typeof visualValue) === 'string')
      visualValue = visualValue.replaceAll("\\", "")

    //console.log("visualValue", visualValue)

    this.enabledAndSetFieldValue(fieldAction.fieldName, object, (typeof visualValue) != 'object' ? visualValue : visualValue)
  }

  private setValueForTable(value: any, object: ComponentMaket | IceDocument | IceStepMaket, fieldAction: {
    fieldName: string;
    fieldSet: any;
    isAutoFill: boolean;
    isDisabledAfterFill: boolean
  }) {
    if(Array.isArray(value)){
      object = object as ComponentMaket
      this.enabledAndSetFieldValue("dataObject", object, value.map(item => item.value))

      let resultArray:any[][] = []
      let rowArray: any[] = []

      value.forEach(item => {
        item = item.value
        rowArray = []
        fieldAction.fieldSet.string.forEach((key: string) => {
          let field = key.substring(1,key.length)
          let index = Object.keys(item).findIndex(f => f === field)
          let val = index != -1 ? Object.values(item)[index] : "-"

          rowArray.push(val)
        })
        resultArray.push(...[rowArray])
      })
      this.enabledAndSetFieldValue(fieldAction.fieldName, object, resultArray)
    }
  }

  setValueToOptionListOfSelect(value: any, fieldAction: {fieldName: string;fieldSet: { object: string, string: string } | any,isAutoFill: boolean,isDisabledAfterFill: boolean},
                               object: ComponentMaket | IceDocument | IceStepMaket) {
    if ((typeof value) === "object") {
      let keyName = fieldAction.fieldSet.string.substring(2, fieldAction.fieldSet.string.length - 1)
      let dataForOptionList  = (value as DataSourceMap[]).map(item => {
        let val
        if((typeof item.value) === "object") {
          val = Object.values(item.value)[Object.keys(item.value).findIndex(item => item === keyName)]
        }
        else {
          val = item.value
        }
        return {data: item.value, value: ((val ?? "") as string).replaceAll("\\", "")}
      })
      this.enabledAndSetFieldValue(fieldAction.fieldName, object, dataForOptionList)
    } else {
      this.enabledAndSetFieldValue(fieldAction.fieldName, object, [{data: value, value: value}])
    }
  }

  enabledAndSetFieldValue(fieldName: string,
                          object: ComponentMaket | IceDocument | IceStepMaket, value: any) {
    Object.defineProperty(object, fieldName, {value: value, writable: true, enumerable: true, configurable: true})
  }

  private getFromDataMap(fieldSet: { object: string, string: string } | any): DataSourceMap[] {
    return this.localDataSourceMap.filter(item => item.key === fieldSet.object)
  }


  /**проверить условие выполнения группы*/
  private checkCondition(actionGroup: IActionGroup) {
    let result: boolean[] = []
    actionGroup.conditions.forEach(cond =>{
      let arg1 = this.getArgValue(cond.argument1)
      let arg2 = this.getArgValue(cond.argument2)

      if((typeof arg2) === 'string')
        arg1 = arg1 ? arg1.toString() : ""
      if(arg1 && !isNaN(Number(arg1)))
        arg1 = Number(arg1)
      if(arg2 && !isNaN(Number(arg2)))
        arg2 = Number(arg2)


      // console.log((typeof arg1))
      // console.log((typeof arg2))
      //
      //  console.log("arg1:", arg1)
      //  console.log("arg2:", arg2)
      //  console.log("cond.relation:", cond.relation)


      switch (cond.relation) {
        case "=":
          result.push(arg1 === arg2)
          break;
        case "!=":
          result.push(arg1 !== arg2)
          break;
        case ">":
          result.push(Number(arg1) > Number(arg2))
          break;
        case "<":
          result.push(arg1 < arg2)
      }
    })

     //console.log("cond result: ",result.find(item => item === false) === undefined)
    return result.find(item => item === false) === undefined;//Если хоть одно условие не выполняется
  }

  getArgValue(arg: string){
    if(!this.isDynamicValue(arg))
      return arg
    return this.getValueFromComponent(arg)
  }
  isDynamicValue(arg: string){
    return arg.startsWith("[") && arg.endsWith("]") && arg.includes(".")
  }

  private getValueFromComponent(arg: string): any {
    let componentName = arg.substring(1,arg.length - 1).substring(0,arg.indexOf(".") - 1)
    let fieldName = arg.substring(1,arg.length - 1).substring(arg.indexOf(".") ,arg.length)
    let component = this.localCurrentDocument.docStep.map(item => item.componentMaket).flat().find(item => item.componentName === componentName)
    if(component){
      let keyIndex = Object.keys(component).findIndex(item => item === fieldName )
      if (keyIndex != -1){
        let val = Object.values(component)[keyIndex]
        if(val && !isNaN(Number(val)))
          val = Number(val)
        return  val
      }
    }
    return undefined;
  }
}


