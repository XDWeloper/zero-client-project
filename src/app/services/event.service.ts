import {Injectable} from '@angular/core';
import {EventObject, EventObjectType, IceDocument, IceEvent} from "../interfaces/interfaces";
import {IceMaketComponent} from "../module/admin/classes/icecomponentmaket";
import {IceComponentType} from "../constants";
import {WorkerService} from "./worker.service";

export interface EventNameTitle {eventName: string, eventTitle: string}


@Injectable({
  providedIn: 'root'
})
export class EventService {
  private currentComponent: IceMaketComponent
  isWorkerResize = false

  static instance:EventService


  constructor(private workerService:WorkerService) {
    EventService.instance = this
  }

  launchEvent(eventType: EventObject,currentDocument: IceDocument,workerEventList:IceEvent[],value?: any){
    //console.log("before launchEvent",this.isWorkerResize)
    if(this.isWorkerResize) return;

    if(workerEventList === undefined
      || !workerEventList.map(v => this.getEventObjectFromName(v.eventName)).includes(eventType)) return

    let workerListId = workerEventList
      .filter(value => this.getEventObjectFromName(value.eventName) === eventType)
      .map(value => value.workerIdList).flat()

    // if(eventType === EventObject.ON_STEP_OPEN){
    //   console.log("eventType",eventType)
    //   console.log("&&&&", workerEventList.filter(value => workerEventList.filter(value => this.getEventObjectFromName(value.eventName) === eventType)))
    //
    //   console.log("workerEventList",workerEventList)
    //   console.log("workerListId",workerListId)
    // }

    this.workerService.startWorkers(workerListId, value,currentDocument)
  }


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
      case "ON_DOCUMENT_CREATE": return EventObject.ON_DOCUMENT_CREATE;
      case "ON_DOCUMENT_DESTROY": return EventObject.ON_DOCUMENT_DESTROY;
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










