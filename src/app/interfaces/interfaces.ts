import {DocStat, IceComponentType} from "../constants";
import {DataSource} from "@angular/cdk/collections";
import {IceDataSource} from "../model/IceDataSource";

export interface ComponentRuleForPDF {
  isPrint: boolean
  tabCount?: number
  addDash?: boolean
  newLine?: boolean
  colNum?: number
  tableCol?: number
  redLine?: boolean
  frame?: boolean
  fontSize?: number
  fontStyle?: "normal" | "bold" | "italic" | "semiBold" | undefined
  order?: number
  align?: "left" | "right" | "center"
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
  docStep?: IceStepMaket[],
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

export interface ComponentMaket {
  cellNumber: number | undefined
  componentType: IceComponentType
  inputType: string
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
  optionList?: string[] | undefined
  enabled?: boolean
  visible?: boolean
  printRule: ComponentRuleForPDF
  tableProp?: TableProperties
  dataSource?: IceDataSource[]
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
}

export class TableColumn {
  columnType?: "area" | "input"
  columnMask?: string
  defaultValue?: string
}

export interface ColumnProperties {
  title: string
  subHeader?: string[]
  columnType: "area" | "input"[]
  columnMask: string[]
  headerBgColor?: string
  headerTextColor?: string
  subHeaderColor?: string
  subHeaderTextColor?: string
  headerFontSize?: number
  subHeaderFontSize?: number
  headerFontStyle?: "normal" | "bold" | "italic" | "semiBold" | undefined
  subHeaderFontStyle?: "normal" | "bold" | "italic" | "semiBold" | undefined
}

export interface IceStepMaket {
  stepNum: number
  stepName: string
  componentMaket: ComponentMaket[]
  checkedText?: string | undefined
  visible?: boolean
}


export interface IceDocumentMaket{
  docId: number
  docName: string
  docStep: IceStepMaket[]
  isActive?: boolean,
  isLoaded?: boolean,
  dataSource?: IceDataSource[]
}

export interface IceComponent {
  inputType: string;
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
  optionList?: string[] | undefined
  enabled?: boolean
  visible?: boolean
  printRule: ComponentRuleForPDF
  tableProp?: TableProperties

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
  inputType: string | undefined
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

export interface PlaceComponentValue {
  placeObjectList: PlaceObject[]
}

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
