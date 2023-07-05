import {Component, EventEmitter, Output} from '@angular/core';
import {tableList} from "../../../../constants";

@Component({
  selector: 'app-change-table',
  templateUrl: './change-table.component.html'
})


export class ChangeTableComponent {

  tableList = tableList

  @Output()
  tableNum = new EventEmitter()

  changeTable(num: number) {
    this.tableNum.next(num)
  }
}
