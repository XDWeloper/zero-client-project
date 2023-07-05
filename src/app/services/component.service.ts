import {ComponentRef, Injectable} from '@angular/core';
import {BehaviorSubject, ReplaySubject, Subject} from "rxjs";
import {IceMaketComponent} from "../module/admin/classes/icecomponentmaket";
import {ComponentChangeValue, IceComponent} from "../interfaces/interfaces";

@Injectable({
  providedIn: 'root'
})
export class ComponentService {

  private _componentCollection: ComponentRef<IceMaketComponent>[] = new Array()

  selectedComponent$ = new Subject<number>()
  rightClick$ = new Subject<any>()
  selectedDocumentComponent$ = new Subject<IceComponent>()
  changeValue$ = new ReplaySubject<ComponentChangeValue>(undefined)
  isModifyed$ = new Subject<boolean>()

  constructor() {
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

  set componentCollection(value: ComponentRef<IceMaketComponent>[]) {
    this._componentCollection = value;
  }

  addComponent(component: ComponentRef<IceMaketComponent>) {
    this._componentCollection.push(component)
  }

  removeComponent(componentID: number) {
    let comp = this._componentCollection.find(c => c.instance.componentID === componentID)
    let index = this._componentCollection.findIndex(c => c.instance.componentID === componentID)
    this._componentCollection.splice(index, 1)
    comp.destroy()
  }

  getComponent(componentID: number): IceMaketComponent {
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
