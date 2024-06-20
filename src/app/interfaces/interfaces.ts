import {DocStat, IceComponentType} from "../constants";
import {IceDataSource} from "../workers/IceDataSource";
import {IDataSource, IWorker} from "../workers/workerModel";

export interface ReportData {
  uuid:string,
  status:string,
  message:string,
  data:string,
  reportFile:string
}

export interface ComponentRuleForPDF {
  isPrint: boolean
  tabCount?: number
  addDash?: boolean
  newLine?: boolean
  colNum?: number
  tableCol?: number
  redLine?: boolean
  repeatLine?: number
  frame?: boolean
  fontSize?: number
  fontStyle?: "normal" | "bold" | "italic" | "semiBold" | undefined
  order?: number
  align?: "left" | "right" | "center"
  onlyValue?: boolean
}

export interface BankFile {
  "id": string,
  "name": string,
  "size": number,
  "status": string,
  "contentType": string,
  "fileName": string,
  "fileDirection": string

}

export interface UploadFile {
  id?: string
  name: string
  size: number
  status: string
  progress?: number
}

export interface LoginPasswordProperties{
loginLengthMin: number,
loginLengthMax: number,
passwordLengthMin: number,
passwordLengthMax: number,
passwordSpecSymbols: string,
passwordMustContainsDigitsMin: number,
passwordMustContainsSpecSymbolsMin: number,
passwordMustContainsCapitalLettersMin: number,
loginRegExpString: string,
passwordRegExpString: string,
passwordRegExpMaskedString : string,
loginValidatorHint: string,
passwordValidatorHint : string
}


export interface OtpResult {
  id: string,
  maskedPhone: string,
  otpType: string,
  otpLength: number,
  otpAttempt: number,
  otpTime: number,
  dcreate: Date
}

export interface MessageDialog {
  message: string,
  hideMessage?: string,
  dialogType?: DialogType,
  dialogButtonsType?: DialogButtonType[]
}

export type DialogButtonType = "YES" | "CANCEL" | "NO" | "CLOSE"
export type DialogType = "ERROR" | "INFO"
export type OtpType = "REGISTRATION" | "RESET_PASSWORD"
export type OpenDocType = "EDIT" | "VIEW"


export interface ComponentChangeValue{
  componentId: number,
  value: any,
  checkedText?: string | undefined
}

export interface IceDocument{
  id?: number,
  maketId: number
  docName: string,
  createDate?: Date,
  status?: DocStat,
  statusText?: string
  responseDocReference?: string | undefined,
  docStep: IceStepMaket[]
  docAttrib: IceDocAttrib
  customAttrib?: any
  changed?: boolean
  reportId ?: number
}

export interface IceDocumentMaket{
  docId: number
  docName: string
  isActive?: boolean,
  isLoaded?: boolean,
  docStep: IceStepMaket[]
  docAttrib?: IceDocAttrib
  customAttrib?: any
  reportId ?: number
}


export type Role = "ROLE_user" | "ROLE_admin" | "ROLE_operator"

export interface Cell{
  bound: DOMRect,
  number: number,
  refresh: boolean
}

export interface DocumentTreeTempl {
  id: number
  name: string
  children?: StepTreeTempl[]
  isActive: boolean
  isModified?: boolean
  isExpand?: boolean
}

export interface StepTreeTempl {
  parentId: number
  num: number
  name: string
  visible?: boolean
  isToolBar?: boolean
  stepEvent?: IceEvent[]
}

export interface ResponseTree {
  id: number
  docName: string
  isActive: boolean
  docStep: ResponseTreeStep[]
}

export interface ResponseTreeStep {
  stepNum: number
  stepName: string
  componentMaket: ComponentMaket[]
  visible?: boolean
}



export interface ComponentBound{
  x:number
  y:number
  widthScale: number
  heightScale: number
}

export interface TextPosition {
  horizontal: string
  vertical: string
}

export type ComponentInputType = "text" | "number" |"summ" | "datetime-local" | "date" | "time" | "week" | "month" | "checkbox" | "radio" | "color" | "button"

export interface ComponentModifyField {
  value: any
  checkedText?: string | undefined
  optionList?: string[] | undefined
  enabled?: boolean
  visible?: boolean
}

export interface ComponentMaket {
  cellNumber: number | undefined
  componentType: IceComponentType
  inputType: ComponentInputType
  componentName: string | undefined
  componentID:number
  bound: ComponentBound
  value: any
  placeHolder: string
  textColor: string
  backgroundColor: string
  required: boolean
  textPosition: TextPosition
  tableType: number | undefined
  frameColor: string | undefined
  minLength: number | undefined
  maxLength: number | undefined
  regExp: string | undefined
  minVal: number | undefined
  maxVal: number | undefined
  notification: string | undefined
  masterControlList: MasterControl[]
  checkedText?: string | undefined
  optionList?: OptionList[] | undefined
  enabled?: boolean
  visible?: boolean
  printRule: ComponentRuleForPDF
  tableProp?: TableProperties
//  dataSource?: IceDataSource[]
  componentEvent?: IceEvent[]
  dataObject?: any
  changeProp?: string
  customAttribName?: string
  customAttribColumnName?: string
  radioGroupID?: number
}

export type FontWeight = "normal" | "bold" | "semiBold"

export class TableProperties {
  header: Header[]
}
export class Header{
  title: string
  order: number
  bgColor?: string
  textColor?: string
  fontSize?: number
  fontWeight?: FontWeight | undefined
  fontItalic?: boolean
  subHeader: SubHeader[]
  width?: number | undefined
}

export class SubHeader {
  title?: string
  order: number
  bgColor?: string
  textColor?: string
  fontSize?: number
  fontWeight?: FontWeight | undefined
  fontItalic?: boolean
  column: TableColumn
  width?: number | undefined
}

export class TableColumn {
  columnType?: "area" | "input"
  columnMask?: string
  defaultValue?: string
}

// export interface ColumnProperties {
//   title: string
//   subHeader?: string[]
//   columnType: "area" | "input"[]
//   columnMask: string[]
//   headerBgColor?: string
//   headerTextColor?: string
//   subHeaderColor?: string
//   subHeaderTextColor?: string
//   headerFontSize?: number
//   subHeaderFontSize?: number
//   headerFontStyle?: "normal" | "bold" | "italic" | "semiBold" | undefined
//   subHeaderFontStyle?: "normal" | "bold" | "italic" | "semiBold" | undefined
// }

export interface IceStepMaket {
  stepNum: number
  stepName: string
  componentMaket: ComponentMaket[]
  checkedText?: string | undefined
  visible?: boolean
  isToolBar?: boolean
  stepEvent?: IceEvent[]
}


export interface IceDocAttrib {
  checkGroupList?: CheckRadioGroup[]          /** Список групп радио кнопок*/
  dataSourceList?: IDataSource[]              /** Дата сеты тут*/
  workerList?: IWorker[]                      /** Воркеры документа*/
  documentEventList?: IceEvent[]              /** События на уровне документа */
  componentValueList?: IIceComponentValue[]   /** Храним отдельно данные компонентов в виде: ключ/значение */
}

export interface CheckRadioGroup {
  id: number,
  name: string,
  checkList: CheckedButton[]
}

export interface CheckedButton {
  id: number,
  name: string
}

export interface IIceComponentValue{
  componentName: String
  componentValue?: any
  componentType: IceComponentType
  readOnly: boolean
  componentDescription?: String
  dataObject?: any
}

export class IceComponentValue implements IIceComponentValue{


  constructor(componentName: String, componentValue: any, componentType: IceComponentType, componentDescription: String, readOnly: boolean, dataObject?: any) {
    this.componentName = componentName;
    this.componentValue = componentValue;
    this.componentType = componentType;
    this.componentDescription = componentDescription;
    this.readOnly = readOnly;
    this.dataObject = dataObject
  }

  componentName: String
  componentValue?: any
  componentType: IceComponentType
  componentDescription: String;
  readOnly: boolean;
  dataObject?: any
}

export interface IceEvent {
  eventName: string
  workerIdList: {id: number, order: number}[]
}

export type OptionList = {data: any, value: string}

export interface IceComponent {
  inputType: ComponentInputType;
  stepNum: number;
  correctX: number;
  correctY: number;
  cellNumber: number
  componentType: IceComponentType
  componentName: string
  componentID:number
  value: any
  placeHolder: string
  componentBound: ComponentBound
  required: boolean
  textPosition: TextPosition
  tableType: number | undefined
  frameColor: string | undefined
  minLength: number | undefined
  maxLength: number | undefined
  regExp: string | undefined
  minVal: number | undefined
  maxVal: number | undefined
  notification: string | undefined
  masterControlList: MasterControl[]
  checkedText?: string | undefined
  optionList?: OptionList[] | undefined
  enabled?: boolean
  visible?: boolean
  printRule: ComponentRuleForPDF
  tableProp?: TableProperties
  componentEvent?: IceEvent[]
  dataObject?: any
  customAttribName?: string
  customAttribColumnName?: string
  radioGroupID?: number
}

export class MasterControl{
  componentName: string | undefined
  componentID:number
  componentValue: any
  controlProp: ControlPropType
}

export interface ComponentControl{
  componentID: number,
  componentName: string,
  componentType: string,
  inputType: ComponentInputType | undefined
}

export interface StepControl{
  stepName: string,
  component: ComponentControl[]
}

export interface ControlValue{
  name: string
  value: any
}

export enum ControlPropType{
  ENABLED = "Активно",
  DISABLED = "Не активно",
  VISIBLE = "Видимый",
  INVISIBLE = "Не видимый",
  VALUE = "Значение"
}

export enum DocStatus{
  DRAFT = "Черновик",
  SENDING = "Отправлен в банк",
  AGREE = "Требует подтверждения пользователем",
  CONTROL = "Предварительный контроль",
  PROCESSING = "На рассмотрении",
  INCORRECT = "Требует корректировки",
  ACCEPTED = "Принят",
  REJECTED = "Отвергнут"
}

export enum EventObject {

  ON_DOCUMENT_CREATE = "Создание документа",
  ON_DOCUMENT_OPEN = "Открытие документа",
  ON_DOCUMENT_CLOSE = "Закрытие документа",
  ON_DOCUMENT_CHANGE_STEP = "Изменение страницы",
  ON_DOCUMENT_DESTROY = "Удаление документа",

  ON_STEP_OPEN ="Открытие страницы",
  ON_STEP_CLOSE ="Закрытие страницы",

  ON_COMPONENT_INIT = "Создание компонента",
  ON_COMPONENT_CLICK = "Клик на компоненте",
  ON_COMPONENT_CHANGE_VALUE = "Изменение данных компонента",
  ON_COMPONENT_SET_VALUE = "Установка данных компонента",
  ON_COMPONENT_DESTROY = "Удаление компонента",
}

export type EventObjectType = "DOCUMENT" |  "STEP" | "COMPONENT"


export interface PlaceObject{
  id: number,
  regionCode: number,
  code: string,
  name: string,
  typeName: string,
  objectId: number,
  parentObjId: number,
  objectGuid: string,
  clevel: number,
  cnumber: string,
  domType: string,
  domNum: number,
  korp: string,
  dom: string,
  str: string,
  ind: string,
  estStat: string,
  shortName: string
}

// export interface PlaceComponentValue {
//   placeObjectList: PlaceObject[]
// }

export interface Pageable{
  "content": any[],
  "pageable": {
    "sort": {
      "empty": boolean,
      "unsorted": boolean,
      "sorted": boolean
    },
    "offset": number,
    "pageNumber": number,
    "pageSize": number,
    "paged": boolean,
    "unpaged": boolean
  },
  "totalPages": number,
  "totalElements": number,
  "last": boolean,
  "size": number,
  "number": number,
  "sort": {
    "empty": boolean,
    "unsorted": boolean,
    "sorted": boolean
  },
  "numberOfElements": number,
  "first": boolean,
  "empty": boolean
}
