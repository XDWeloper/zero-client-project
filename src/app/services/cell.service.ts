import { Injectable } from '@angular/core';
import {BehaviorSubject, Subject} from "rxjs";
import {CellComponent} from "../module/admin/component/cell/cell.component";
import {Cell} from "../interfaces/interfaces";
import {cellColl, cellRow, collInRow} from "../constants";

@Injectable({
  providedIn: 'root'
})
export class CellService {

  cellList: CellComponent[] = new Array<CellComponent>()
  cellWatchList: CellComponent[] = new Array<CellComponent>()

  cellSubject$ = new Subject<Cell>()
  tableResize$ = new BehaviorSubject<DOMRect>(null)
  tableResizer$ = new Subject<DOMRect>()

  cellFieldSize = collInRow * cellColl * cellRow

  constructor() { }

  getCellNumberFromCoord(positon: {x: number, y:number}): number | undefined{
    let index = undefined
    this.cellList.forEach(value => {
      let cellBound = value.getBounds()
      if(cellBound.x <= positon.x && positon.x <  cellBound.right &&  cellBound.y <= positon.y && positon.y <  cellBound.bottom)
        index = value.index
    })
    return index
  }

  public addCell(cell: CellComponent){
    this.cellList.push(cell)
  }

  getCell(index: number): CellComponent{
    return this.cellList[index]
  }

  getCellBound(index: number): DOMRect {
    return this.getCell(index).getBounds()
  }

  getCellWidth(): number | undefined{
    if(this.cellList.length > 0){
      return this.cellList[0].getBounds().width
    }
    return undefined
  }

  getCellHeight(): number | undefined{
    if(this.cellList.length > 0){
      return this.cellList[0].getBounds().height
    }
    return undefined
  }

  /**Для отображения*/
  public addClientCell(cell: CellComponent){
    this.cellWatchList.push(cell)
  }

  getClientCell(index: number): CellComponent{
    return this.cellWatchList[index]
  }

  getClientCellBound(index: number): DOMRect {
    return this.getClientCell(index).getBounds()
  }

  getClientCellWidth(): number | undefined{
    if(this.cellWatchList.length > 0){
      return this.cellWatchList[0].getBounds().width
    }
    return undefined
  }

  getClientCellHeight(): number | undefined{
    if(this.cellWatchList.length > 0){
      return this.cellWatchList[0].getBounds().height
    }
    return undefined
  }

  clearWatchList(){
    this.cellWatchList.splice(0,this.cellWatchList.length)
  }

}
