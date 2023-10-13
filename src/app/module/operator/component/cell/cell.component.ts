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
      { // @ts-ignore
        this.cellService.addCell(this)
      }
    else
      { // @ts-ignore
        this.cellService.addClientCell(this)
      }
  }

  constructor(private cellService: CellService) {
  }

  public getBounds(): DOMRect {
    return this.cell?.nativeElement.getBoundingClientRect()
  }

}
