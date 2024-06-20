import {ComponentMaket, DialogType, IceDocument, IceStepMaket} from "../interfaces/interfaces";
import {Action, ActionObjectType, IActionGroup, IceWorker, WorkerType} from "./workerModel";
import {DataSourceMap, DataSourceService} from "../services/data-source.service";
import {MessageService} from "../services/message.service";
import {functionNameAndDescription, IceComponentType} from "../constants";
import {DocumentEditorComponent} from "../module/client/component/document-editor/document-editor.component";
import {WorkerService} from "../services/worker.service";
import {computeStartOfLinePositions} from "@angular/compiler-cli/src/ngtsc/sourcemaps/src/source_file";

export class FieldWorker extends IceWorker {

  localDataSourceMap: DataSourceMap[] = []
  localCurrentDocument: IceDocument | undefined = undefined
  localValue: any | undefined = undefined
  isRunning = false

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
    this.isRunning = false
    this.actionGroupList.forEach(actionGroup => {
      this.runActionGroup(actionGroup)
    })
    //console.log("dispatchEvent")
    //window.dispatchEvent(new Event('resize'))

    /**Вот это нужно делать только если воркер сработал*/
    if(this.isRunning){
      //console.log("update window")
      //DocumentEditorComponent.instance.updateCurrentPage()
      DocumentEditorComponent.instance.currentDocument = {...this.localCurrentDocument}
      window.dispatchEvent(new Event('resize'))
    }

    console.log("worker  " + this.name + "  is finished  "  +  this.id)
    //console.log("localCurrentDocument", {...this.localCurrentDocument})
    WorkerService.instance.isWorkerStarted$.next(false)

  }

  private runActionGroup(actionGroup: IActionGroup) {
    if (!this.checkCondition(actionGroup))
      return
    this.isRunning = true
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
      value  = this.getFromDataMap(fieldAction.fieldSet) as DataSourceMap[]
      /**Если данные не получены и идет закрытие компонента, то этого делать не надо*/
      if(fieldAction.isDisabledAfterFill && value && value.length > 0
        && (value as DataSourceMap[]).filter(item => item.value != undefined && item.value != '').length > 0){
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
      visualValue = {placeList: {}, placeString: visualValue ? visualValue.replaceAll("\\", "") : undefined}
    }

    if((typeof visualValue) === 'string')
      visualValue = visualValue.replaceAll("\\", "")

    //console.log("visualValue", visualValue)

    if (visualValue)
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
          let val: any = ""
          if(key != null && key != undefined){
            let field = key.substring(1,key.length)
            let index = Object.keys(item).findIndex(f => f === field)
            val = index != -1 ? Object.values(item)[index] : "-"
            if(Array.isArray(val)){
              val = val.toString()
            }
          }
          rowArray.push(val)
        })
        resultArray.push(...[rowArray])
      })
      this.enabledAndSetFieldValue(fieldAction.fieldName, object, resultArray)
    }
  }

  private setValueToOptionListOfSelect(value: any, fieldAction: {fieldName: string;fieldSet: { object: string, string: string } | any,isAutoFill: boolean,isDisabledAfterFill: boolean},
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

      if(fieldAction.fieldName === "value" && dataForOptionList.length > 0) {
        this.enabledAndSetFieldValue(fieldAction.fieldName, object, dataForOptionList[0])
      }
      else {
        this.enabledAndSetFieldValue(fieldAction.fieldName, object, dataForOptionList)
      }
    } else {
      this.enabledAndSetFieldValue(fieldAction.fieldName, object, [{data: value, value: value}])
    }
  }

  private enabledAndSetFieldValue(fieldName: string,
                          object: ComponentMaket | IceDocument | IceStepMaket, value: any) {
    Object.defineProperty(object, fieldName, {value: value, writable: true, enumerable: true, configurable: true})
  }

  private getFromDataMap(fieldSet: { object: string, string: string } | any): DataSourceMap[] {
    return this.localDataSourceMap.filter(item => item.key === fieldSet.object)
  }

  /**проверить условие выполнения группы*/
  private checkCondition(actionGroup: IActionGroup) {
    let result: boolean = false
    let tmpRes: boolean = false
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
        // console.log("arg1:", arg1)
        // console.log("arg2:", arg2)
        // console.log("cond.relation:", cond.relation)
       // console.log("preRelation",cond.preRelation)

      switch (cond.relation) {
        case "=":
          tmpRes = arg1 === arg2
          break;
        case "!=":
          tmpRes = arg1 !== arg2
          break;
        case ">":
          tmpRes = Number(arg1) > Number(arg2)
          break;
        case "<":
          tmpRes = Number(arg1) < Number(arg2)
      }


      if(cond.preRelation === undefined)
        result = tmpRes
      else {
        if(cond.preRelation === "&&")
          result = result && tmpRes
        if(cond.preRelation === "||")
          result = result || tmpRes
      }

       // console.log("tmpRes",tmpRes)
       // console.log("res",result)
       // console.log("------------------")

    })
    return result
  }

  private getArgValue(arg: string): any{
    let retString: any = arg
    retString = this.checkArg(arg)
    //console.log("checkArg: " + arg)
    //console.log("retString: " + retString)

    if( retString === "ERROR ARGUMENT")
      return  arg

    retString = this.changeDinamicValue(arg)

     // console.log("changeDinamicValue: " + arg)
     // console.log("retString: " + retString)

    retString = this.changeFunction(retString)

    //console.log("changeFunction: " + arg)
    //console.log("retString: " + retString)
    // console.log("--------------------------- ")

    // console.log("arg",arg)
    // console.log("retString",retString)
    return retString
  }

  private getValueFromComponent(arg: string): any {
//    console.log("arg:",arg)
    let componentID = arg.substring(1,arg.length - 1).substring(0,arg.indexOf(".") - 1)
    let fieldName = arg.substring(1,arg.length - 1).substring(arg.indexOf(".") ,arg.length)
    let component = this.localCurrentDocument.docStep.map(item => item.componentMaket).flat()
      .find(item => item.componentID === Number(componentID))
    if(component){
      let keyIndex = Object.keys(component).findIndex(item => item === fieldName )
      if (keyIndex != -1){
        let val = Object.values(component)[keyIndex]
        if(val && (typeof val) != 'boolean' &&!isNaN(Number(val)))
          val = Number(val)
        return  val
      }
    }
    return undefined;
  }

  private changeFunction(arg: string): any {
    if(arg === undefined || (arg.length < 1)) return arg
    if(functionNameAndDescription.map(item => arg.includes(item.name)).length < 1) return arg
    let result: any = arg

    functionNameAndDescription.forEach(func => {
      if(arg.includes(func.name)){

        let startFuncIndex = arg.indexOf(func.name,0)
        let startArgFuncIndex = arg.indexOf("(", startFuncIndex) +1
        let endArgFuncIndex = arg.indexOf(")", startArgFuncIndex)
        let clearFuncArgs = arg.substring(startArgFuncIndex, endArgFuncIndex)

        let source: any = ""
        let argArray: any[] = []

        if(clearFuncArgs != ""){
          argArray = clearFuncArgs.split(",")
        }


        let firstIndex = 0
        if(arg.charAt(startFuncIndex - 1) === "."){
          for(let i = startFuncIndex ; i > 0; i--){
            if(arg.charAt(i) === " ") {
              firstIndex = i
              break
            }
          }
          source = arg.substring(firstIndex, startFuncIndex - 1)
        }
        result =  arg.replaceAll(arg.substring(firstIndex,endArgFuncIndex + 1),this.realiseFunc(func.name, source,argArray))
      }
    })
    return result;
  }

  private changeDinamicValue(arg: string):any {
    if(arg === undefined || (arg.length < 1)) return arg
    //console.log("----------- changeDinamicValue", arg)
    let dinValPosition: {argName: string}[] = []
    let tmpArgName = ""
    let isReadArg= false

    for(let i = 0; i < arg.length; i++){
      let currentChar = arg.charAt(i)
      if(currentChar === "["){
        isReadArg = true
      }
      if(currentChar === "]"){
        isReadArg = false
        dinValPosition.push({argName:tmpArgName + currentChar})
        tmpArgName = ""
      }
      if(isReadArg){
        tmpArgName += currentChar
      }
    }
    //console.log("dinValPosition",dinValPosition)
    dinValPosition.forEach(dArg =>{
      let val: any = this.getValueFromComponent(dArg.argName)
      val = val === undefined ? "" : val
      arg = arg.replaceAll(dArg.argName, val)
    })
    //console.log(arg)
    return arg
  }

  private checkArg(arg: string) {
    let result = false
    let openCount = (arg.match(/[[]/gm) || []).length
    let closeCount = (arg.match(/]/gm) || []).length
    result = openCount === closeCount
    openCount = (arg.match(/[(]/gm) || []).length
    closeCount = (arg.match(/[)]/gm) || []).length
    result = result && (openCount === closeCount)
    return result ? arg : "ERROR ARGUMENT";
  }

  private realiseFunc(funcName: string, source: any, args: any[]): any{
    let result: any = ""
    if(funcName === "substring" && source){
      let startIndex = args[0] ? args[0] : 0
      let endIndex = args[1] ? args[1] : source.length
      result = source.substring(startIndex ,endIndex)
    }
    if(funcName === "length" && source){
        result = source.length
    }
    return result
  }

}


