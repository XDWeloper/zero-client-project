import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit
} from '@angular/core';
import {IceMaketComponent} from "../../classes/icecomponentmaket";
import {Subscription} from "rxjs";
import {CellService} from "../../../../services/cell.service";
import {ComponentService} from "../../../../services/component.service";
import {DomSanitizer} from "@angular/platform-browser";
import {cellColl, collInRow, IceComponentType} from "../../../../constants";
import {CdkDragMove, CdkDragStart} from "@angular/cdk/drag-drop";
import {DocumentService} from "../../../../services/document.service";

export const marginPixels = 0

@Component({
  selector: 'app-maket',
  templateUrl: './maket.component.html',
  styleUrls: ["./maket.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaketComponent extends IceMaketComponent implements OnInit, OnDestroy, AfterContentInit {

  isSelected = false
  dragPosition = {x: 0, y: 0};
  defaultDragPosition = {x: 0, y: 0};
  width: number
  height: number
  isResized = false
  isDragged = false
  private _isHover = false


  currentCell: DOMRect
  tableCorrectX: number = 0
  tableCorrectY: number = 0

  private cellSubject$: Subscription
  private selectedComponent$: Subscription
  private tableResize$: Subscription
  private tableResizer$: Subscription
  private numObserv$: Subscription
  private resizeStartX: number
  private resizeStartY: number
  private isRightClicked = false
  private draggedComponent: IceMaketComponent[] = []
  isResizable = true
  draggedPrepare: boolean = false;


  constructor(public cellService: CellService,
              private componentService: ComponentService,
              public sanitizer: DomSanitizer,
              private documentService: DocumentService, private changeDetection: ChangeDetectorRef) {
    documentService.lastComponentIndex++
    super(0, documentService.lastComponentIndex)
    this.visible = true
    this.enabled = true
  }


  ngAfterContentInit(): void {
    this.initObservables()
  }

  ngOnDestroy(): void {
    // this.cellSubject$.unsubscribe()
    // this.selectedComponent$.unsubscribe()
    // this.tableResize$.unsubscribe()
    // this.tableResizer$.unsubscribe()
    // this.numObserv$.unsubscribe()
  }

  ngOnInit(): void {
    this.setSize()
    this.initComponent()
    if (this.textPosition === undefined)
      this.textPosition = {vertical: 'top', horizontal: 'left'}

    this.componentService.moveComponent$.subscribe(value => {
      if (value.id === this.componentID) {
        this.dragPosition = {x: this.defaultDragPosition.x + value.deltaX, y: this.defaultDragPosition.y + value.deltaY};
      }
    })
  }

  setBound(val: DOMRect) {
    if (this.cellNumber !== null) {
      this.tableCorrectX = val.x
      this.tableCorrectY = val.y
      this.setCorrectBound()
      this.initPositionOnMouseEvent()
    }
  }

  get isHover(): boolean {
    return this._isHover;
  }

  set isHover(value: boolean) {
    this._isHover = value;
  }

  selected(event: CdkDragStart | CdkDragMove | MouseEvent) {
    this.isSelected = true
    if ((event as MouseEvent).ctrlKey === false && (event as MouseEvent).button != 2 && (this.draggedPrepare === false  || this.componentService.selectedComponentsId.length === 1)) {
      this.componentService.clearSelectedComponentList()
    }

    this.componentService.addComponentToSelectedList(this.componentID)
  }

  rightClick(event: MouseEvent) {
    this.isRightClicked = true
    event.stopPropagation();
    this.componentService.rightClick$.next(
      {
        event: event,
        compID: this.componentID,
        compType: this.componentType
      })
    return false;
  }

  private setSize() {
    if (this.bound !== undefined) return
    this.height = this.cellService.getCellHeight()

    switch (this.componentType) {
      case IceComponentType.TEXT:
        this.width = this.cellService.getCellWidth() * collInRow * cellColl;
        break;
      case IceComponentType.INPUT:
        this.width = this.cellService.getCellWidth() * 3 * cellColl;
        break;
      case IceComponentType.SELECT:
        this.width = this.cellService.getCellWidth() * 3 * cellColl;
        break;
      case IceComponentType.AREA:
        this.width = this.cellService.getCellWidth() * collInRow * cellColl;
        this.height = this.cellService.getCellHeight() * 3
        break;
      case IceComponentType.TABLE:
        this.width = this.cellService.getCellWidth() * collInRow * cellColl;
        this.height = this.cellService.getCellHeight() * 3
        break;
      case IceComponentType.PLACE:
        this.width = this.cellService.getCellWidth() * collInRow * cellColl;
        this.height = this.cellService.getCellHeight()
        break;
      case IceComponentType.UPLOAD:
        this.width = this.cellService.getCellWidth() * 8 * cellColl;
        this.height = this.cellService.getCellHeight() * 8
        break;
    }
    this.bound = {
      x: this.dragPosition.x,
      y: this.dragPosition.y,
      heightScale: (this.height / this.cellService.getCellHeight()),
      widthScale: (this.width / this.cellService.getCellWidth())
    }

  }

  mouseDown($event: MouseEvent) {
    this.isResized = true
    this.resizeStartX = $event.x
    this.resizeStartY = $event.y
  }

  @HostListener('window:mousemove', ['$event'])
  drag($event: MouseEvent) {
    if (this.isResized === true) {
      this.width += $event.x - this.resizeStartX
      this.resizeStartX = $event.x
      if (this.componentType !== IceComponentType.INPUT && this.componentType !== IceComponentType.SELECT) {
        this.height += $event.y - this.resizeStartY
        this.resizeStartY = $event.y
      }
      this.changeDetection.detectChanges()
    }
  }

  dragComponent($event: CdkDragMove<any>) {
    //Проверить если это групповое перемещение
    if (this.componentService.selectedComponentsId.length > 1) {
      this.componentService.selectedComponentsId.forEach(compId => {
        if (compId != this.componentID) {
          this.componentService.moveComponent$.next({id: compId, deltaX: $event.distance.x, deltaY: $event.distance.y})
        }
      })
    }
  }

  @HostListener('window:mouseup', ['$event'])
  windowMouseUp() {
    if (this.isResized === true) {
      this.isResized = false
      let hScale = this.height / this.cellService.getCellHeight()
      let wScale = this.width / this.cellService.getCellWidth()
      let predHCell = Math.trunc(hScale)
      let predWCell = Math.trunc(wScale)
      let nextHCell = predHCell + 1
      let nextWCell = predWCell + 1

      if ((hScale - predHCell) < 0.2) hScale = predHCell
      if ((nextHCell - hScale) < 0.2) hScale = nextHCell

      if ((wScale - predWCell) < 0.2) wScale = predWCell
      if ((nextWCell - wScale) < 0.2) wScale = nextWCell

      this.bound = {
        x: this.dragPosition.x + marginPixels,
        y: this.dragPosition.y + marginPixels,
        heightScale: hScale - marginPixels,
        widthScale: wScale - marginPixels
      }
      this.setCorrectBound()
    }
  }

  public setCorrectBound() {
    if (!this.bound) return
    this.width = (this.cellService.getCellWidth() * this.bound.widthScale)
    this.height = (this.cellService.getCellHeight() * this.bound.heightScale)
    this.changeDetection.detectChanges()
    this.defaultDragPosition = {...this.dragPosition}
  }

  private initObservables() {
    this.selectedComponent$ = this.componentService.selectedComponent$.subscribe(selID => {
      if (selID) {
        this.isSelected = selID.includes(this.componentID)
      }
    })

    this.numObserv$ = this.numberObserve$.subscribe(v => {
      if ((!this.isHover && !this.isDragged && !this.isSelected) || this.isHover) {
        this.setDragPosition();
      }
    })


    this.tableResize$ = this.cellService.tableResize$.subscribe(val => {
      if (val !== null) {
        this.setBound(val)
      }
    })

    this.tableResizer$ = this.cellService.tableResizer$.subscribe(() => {
      this.correctToCellBound()
    })
  }

  private setDragPosition() {
    if (!this.currentCell) return
    this.dragPosition = {
      x: this.currentCell.left - this.tableCorrectX - 1,
      y: this.currentCell.top - this.tableCorrectY - 1
    }
    this.setCorrectBound()
  }

  initPositionOnMouseEvent() {
    this.cellSubject$ = this.cellService.cellSubject$.subscribe(val => {
      if (val === null) return

      if ((this.isSelected && !this.isResized && !this.isRightClicked)) {
        if(this.isHover) {
          this.currentCell = this.cellService.getCellBound(val.number)
          this.cellNumber = val.number
        }else{/**нужно получить номер ячейки по координатам компонента*/
          let cellIndex = this.cellService.getCellNumberFromCoord({x: this.dragPosition.x + this.tableCorrectX,y: this.dragPosition.y + this.tableCorrectY})
          if(cellIndex) {
            this.currentCell = this.cellService.getCellBound(cellIndex)
            this.cellNumber = cellIndex
            this.setDragPosition();
          }
        }
      }
      this.isRightClicked = false
    })
  }

  correctToCellBound() {
    if (this.cellNumber !== undefined) {
      let bound = this.cellService.getCellBound(this.cellNumber)
      this.dragPosition = {
        x: bound.left - this.tableCorrectX,
        y: bound.top - this.tableCorrectY
      }
      this.setCorrectBound()
    }
  }

  private initComponent() {
    if (this.componentType !== IceComponentType.TEXT)
      this.value = undefined
  }


  dragEnd() {
    this.draggedPrepare = false
  }
}
