import {IceComponentType} from "../../../constants";
import {
  ComponentBound,
  ComponentMaket,
  ComponentRuleForPDF,
  MasterControl, TableProperties,
  TextPosition
} from "../../../interfaces/interfaces";
import {BehaviorSubject} from "rxjs";
import {IceDataSource} from "../../../model/IceDataSource";

export class IceMaketComponent {

  private _cellNumber: number | undefined
  private _componentType: IceComponentType
  private _componentName: string | undefined
  private _componentID: number
  private _bound: ComponentBound
  private _value: any
  private _placeHolder: string
  private _textColor: string
  private _backgroundColor: string
  private _inputType: string
  private _required: boolean
  private _textPosition: TextPosition;
  private _tableType: number
  private _frameColor: string | undefined

  private _minLength: number | undefined
  private _maxLength: number | undefined
  private _regExp: string | undefined
  private _minVal: number | undefined
  private _maxVal: number | undefined
  private _notification: string | undefined
  private _checkText: string | undefined;
  private _optionList: string[] | undefined
  private _printRule: ComponentRuleForPDF;
  private _tableProp?: TableProperties
  private _dataSource?: IceDataSource[]


  get dataSource(): IceDataSource[] {
    return this._dataSource;
  }

  set dataSource(value: IceDataSource[]) {
    this._dataSource = value;
  }

  get tableProp(): TableProperties {
    return this._tableProp;
  }

  set tableProp(value: TableProperties) {
    this._tableProp = value;
  }

  private _masterControlList: MasterControl[] | undefined
  numberObserve$ = new BehaviorSubject<number>(0)

  constructor(cellNumber: number | undefined, idNumber: number) {
    this._cellNumber = cellNumber;
    this.componentID = idNumber
    //this._componentID = IceMaketComponent.componentCounter++
  }


  get printRule(): ComponentRuleForPDF {
    return this._printRule;
  }

  set printRule(value: ComponentRuleForPDF) {
    this._printRule = value;
  }

  get optionList(): string[] | undefined {
    return this._optionList;
  }

  set optionList(value: string[] | undefined) {
    this._optionList = value;
  }

  get checkText(): string | undefined {
    return this._checkText;
  }

  set checkText(value: string | undefined) {
    this._checkText = value;
  }

  get masterControlList(): MasterControl[] | undefined {
    return this._masterControlList;
  }

  set masterControlList(value: MasterControl[] | undefined) {
    this._masterControlList = value;
  }

  get notification(): string | undefined {
    return this._notification;
  }

  set notification(value: string | undefined) {
    this._notification = value;
  }

  get maxLength(): number | undefined {
    return this._maxLength;
  }

  set maxLength(value: number | undefined) {
    this._maxLength = value;
  }

  get regExp(): string | undefined {
    return this._regExp;
  }

  set regExp(value: string | undefined) {
    this._regExp = value;
  }

  get minLength(): number | undefined {
    return this._minLength;
  }

  set minLength(value: number | undefined) {
    this._minLength = value;
  }

  get minVal(): number | undefined {
    return this._minVal;
  }

  set minVal(value: number | undefined) {
    this._minVal = value;
  }

  get maxVal(): number | undefined {
    return this._maxVal;
  }

  set maxVal(value: number | undefined) {
    this._maxVal = value;
  }

  get frameColor(): string | undefined {
    return this._frameColor;
  }

  set frameColor(value: string | undefined) {
    this._frameColor = value;
  }

  get tableType(): number {
    return this._tableType;
  }

  set tableType(value: number) {
    this._tableType = value;
  }

  get textPosition(): TextPosition {
    return this._textPosition;
  }

  set textPosition(value: TextPosition) {
    this._textPosition = value;
  }

  get required(): boolean {
    return this._required;
  }

  set required(value: boolean) {
    this._required = value;
  }

  get inputType(): string {
    return this._inputType;
  }

  set inputType(value: string) {
    this._inputType = value;
  }

  get bound(): ComponentBound {
    return this._bound;
  }

  set bound(value: ComponentBound) {
    this._bound = value;
  }

  get backgroundColor(): string {
    return this._backgroundColor;
  }

  set backgroundColor(value: string) {
    this._backgroundColor = value;
  }

  get placeHolder(): string {
    return this._placeHolder;
  }

  set placeHolder(value: string) {
    this._placeHolder = value;
  }

  get textColor(): string {
    return this._textColor;
  }

  set textColor(value: string) {
    this._textColor = value;
  }

  public setValue(val: any) {
    if (this._componentType === IceComponentType.TEXT)
      this._value = (val as string)
    else
      this._value = val
  }


  public get componentType(): IceComponentType {
    return this._componentType;
  }


  set componentType(value: IceComponentType) {
    this.componentName = value.toString() + this.componentID
    this._componentType = value;
  }

  public get componentName(): string | undefined {
    return this._componentName;
  }


  set componentName(value: string | undefined) {
    this._componentName = value;
  }

  set componentID(value: number) {
    this._componentID = value;
  }

  public get componentID(): number {
    return this._componentID;
  }


  get cellNumber(): number | undefined {
    return this._cellNumber;
  }

  set cellNumber(value: number | undefined) {
    this._cellNumber = value;
    this.numberObserve$.next(value)
  }

  get value(): any {
    return this._value;
  }

  set value(value: any) {
    this._value = value;
  }

  getCompanentMaket(): ComponentMaket {
    return {
      printRule: this.printRule,
      cellNumber: this.cellNumber,
      componentType: this.componentType,
      componentName: this.componentName,
      componentID: this.componentID,
      bound: this.bound,
      value: this.value,
      placeHolder: this.placeHolder,
      textColor: this.textColor,
      backgroundColor: this.backgroundColor,
      inputType: this.inputType,
      required: this.required,
      textPosition: this._textPosition,
      tableType: this.tableType,
      frameColor: this.frameColor,
      minLength: this.minLength,
      maxLength: this.maxLength,
      regExp: this.regExp,
      minVal: this.minVal,
      maxVal: this.maxVal,
      notification: this.notification,
      masterControlList: this.masterControlList,
      checkedText: this.checkText,
      optionList: this.optionList,
      tableProp: this.tableProp,
      dataSource: this.dataSource
  }
  }
}
