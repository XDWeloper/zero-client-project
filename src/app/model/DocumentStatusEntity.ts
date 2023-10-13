import {DocStat} from "../constants";

export class DocumentStatusEntity {
  id: number
  documentRef: number
  createDate: Date
  status: DocStat
  statusDate: Date
  statusText: string
  createUserRef: string
  createUserName: string
  directionType: string
}
