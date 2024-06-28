import {ComponentRef, Injectable} from '@angular/core';
import {BehaviorSubject, ReplaySubject, Subject} from "rxjs";
import {IceMaketComponent} from "../module/admin/classes/icecomponentmaket";
import {ComponentChangeValue, ComponentMaket, IceComponent} from "../interfaces/interfaces";



@Injectable({
  providedIn: 'root'
})
export class ComponentService {

  private _componentCollection: ComponentRef<IceMaketComponent>[] = new Array()
  private _selectedComponentsId: number[] = []
  private _copyBufferMaket: ComponentMaket[] = []

  selectedComponent$ = new Subject<number[]>()
  moveComponent$ = new Subject<{id: number, deltaX: number, deltaY: number}>()
  rightClick$ = new Subject<any>()
  selectedDocumentComponent$ = new Subject<IceComponent>()
  changeValue$ = new ReplaySubject<ComponentChangeValue>(undefined)
  isModifyed$ = new Subject<boolean>()

  constructor() {
  }


  get copyBufferMaketList(): ComponentMaket[] {
    return this._copyBufferMaket;
  }

  get selectedComponentsId(): number[] {
    return this._selectedComponentsId;
  }

  addComponentToSelectedList(id: number){
    if(this._selectedComponentsId.includes(id)) return
    this._selectedComponentsId.push(id)
    this.selectedComponent$.next(this._selectedComponentsId)
  }

  clearSelectedComponentList(){
    this._selectedComponentsId.splice(0, this._selectedComponentsId.length)
    this.selectedComponent$.next(this._selectedComponentsId)
  }


  clearCopyBuffer(){
    this._copyBufferMaket.splice(0,this._copyBufferMaket.length)
  }

  setModified(value: boolean){
    this.isModifyed$.next(value)
  }

  setComponentValue(item: ComponentChangeValue){
    this.changeValue$.next(item)
  }


  get componentCollection(): ComponentRef<IceMaketComponent>[] {
    return this._componentCollection;
  }

  // set componentCollection(value: ComponentRef<IceMaketComponent>[]) {
  //   this._componentCollection = value;
  // }

  addComponent(component: ComponentRef<IceMaketComponent>) {
    this._componentCollection.push(component)
  }

  removeComponent(componentID: number) {
    let comp = this._componentCollection.find(c => c.instance.componentID === componentID)
    let index = this._componentCollection.findIndex(c => c.instance.componentID === componentID)
    this._componentCollection.splice(index, 1)
    comp.destroy()
  }

  removeSelectedComponent(){
    this._selectedComponentsId.forEach(id => this.removeComponent(id))
  }

  getComponent(componentID: number): IceMaketComponent | undefined{
    if(componentID === undefined) return undefined
    return  this._componentCollection.find(c => c.instance.componentID === componentID).instance
  }

  getComponentListSize(): number {
    return this._componentCollection.length
  }

  clearComponentList() {
    this._componentCollection.forEach(c => c.destroy())
    this._componentCollection.splice(0, this.getComponentListSize())
  }


}
