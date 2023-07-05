import {IceComponentType} from "../../../constants";

export class IceComponent {
  static componentCounter: number = 0

  private _cellNumber: number | undefined
  private _componentType: IceComponentType
  private _componentName: string | undefined
  private _componentID:number

  private _value: any

  constructor(cellNumber: number | undefined, componentType: IceComponentType) {
    this._cellNumber = cellNumber;
    this._componentType = componentType;
    this._componentName = componentType.toString() + IceComponent.componentCounter
    this._componentID = IceComponent.componentCounter++
  }

  public setValue(val: any){
    if(this._componentType === IceComponentType.TEXT)
      this._value = (val as string)
    else
      this._value = val
  }


  public get componentType(): IceComponentType {
    return this._componentType;
  }

  public get componentName(): string | undefined {
    return this._componentName;
  }

  public get componentID(): number {
    return this._componentID;
  }


  get cellNumber(): number | undefined {
    return this._cellNumber;
  }

  set cellNumber(value: number | undefined) {
    this._cellNumber = value;
  }

  get value(): any {
    return this._value;
  }

  set value(value: any) {
    this._value = value;
  }
}
