import {Injectable} from '@angular/core';
import {EventObject, EventObjectType} from "../interfaces/interfaces";
import {IceMaketComponent} from "../module/admin/classes/icecomponentmaket";
import {IceComponentType} from "../constants";

export interface EventNameTitle {eventName: string, eventTitle: string}


@Injectable({
  providedIn: 'root'
})
export class EventService {
  currentComponent: IceMaketComponent

  constructor() { }


  isComponentMastHaveEvents(component: IceMaketComponent): boolean{
    this.currentComponent = component
    return component.componentType != IceComponentType.TEXT
  }

  getEventNameAndTitleList(eventObjectType: EventObjectType):EventNameTitle[] {
    let excludeList: string[] = this.getExcludeList()

     return  Object.keys(EventObject).map<EventNameTitle>((value, index) =>
     {
       return {
         eventName: value,
         eventTitle:  Object.values(EventObject)[index]
       }
      }).filter(value => !excludeList.includes(value.eventName) && value.eventName.includes(eventObjectType))
}

  private getExcludeList(): string[]{
    let excludeList: string[] = []

    if(this.currentComponent && this.currentComponent.componentType === IceComponentType.INPUT && this.currentComponent.inputType === 'button')
      excludeList.push(Object.keys(EventObject).find(value => value === "ON_COMPONENT_CHANGE_VALUE"))

    return excludeList
  }

  getEventObjectFromName(eventName: string): EventObject | undefined{
    switch (eventName) {
      case "ON_DOCUMENT_OPEN": return EventObject.ON_DOCUMENT_OPEN;
      case "ON_DOCUMENT_CLOSE": return EventObject.ON_DOCUMENT_CLOSE;
      case "ON_DOCUMENT_CHANGE_STEP": return EventObject.ON_DOCUMENT_CHANGE_STEP;
      case "ON_STEP_OPEN": return EventObject.ON_STEP_OPEN;
      case "ON_STEP_CLOSE": return EventObject.ON_STEP_CLOSE;
      case "ON_COMPONENT_INIT": return EventObject.ON_COMPONENT_INIT;
      case "ON_COMPONENT_CLICK": return EventObject.ON_COMPONENT_CLICK;
      case "ON_COMPONENT_CHANGE_VALUE": return EventObject.ON_COMPONENT_CHANGE_VALUE;
      case "ON_COMPONENT_DESTROY": return EventObject.ON_COMPONENT_DESTROY;
    }
    return undefined
  }

}










