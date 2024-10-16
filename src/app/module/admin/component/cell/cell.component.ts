import {ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {CellService} from "../../../../services/cell.service";
import {cellHeight, CellType} from "../../../../constants";

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CellComponent implements OnInit{

  cellHeight: any;

  @Input()
  cellType: CellType

  @ViewChild('cell')
  private  cell: ElementRef | undefined

  @Input()
  index = 0

  ngOnInit(): void {
    this.cellHeight = cellHeight
    if(this.cellType === CellType.admin)
      this.cellService.addCell(this)
    else
      this.cellService.addClientCell(this)
  }

  constructor(private cellService: CellService) {
  }


  //@HostListener('window:mouseup', ['$event'])
  click(event: MouseEvent){
    if(event.button === 2) return
    let bound = this.cell?.nativeElement.getBoundingClientRect()
    if(event.x >= bound.left && event.x < bound.right &&  event.y >= bound.top && event.y < bound.bottom){
      this.cellService.cellSubject$.next({bound:bound, number: this.index, refresh: false})
    }
  }

  public getBounds(): DOMRect {
    return this.cell?.nativeElement.getBoundingClientRect()
  }

}
