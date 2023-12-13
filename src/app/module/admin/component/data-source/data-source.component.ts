import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from "@angular/material/icon";
import {IceDataSource} from "../../../../model/IceDataSource";

@Component({
  selector: 'app-data-source',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './data-source.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataSourceComponent {

  @Input('dataSource') dataSource: IceDataSource;
  @Input('dataSourceList') dataSourceList : IceDataSource[];
  @Output('currentDataSource') currentDataSource = new EventEmitter<IceDataSource>()
  dataSourceMenuOpen: boolean = false;
  dataSourceMenuPosition: any;


  revertMenu(){
    this.dataSourceMenuOpen = !this.dataSourceMenuOpen
  }

  rightClick($event: MouseEvent) {
    $event.preventDefault();
    this.dataSourceMenuPosition = {x: $event.x, y: $event.y}
    this.revertMenu()
  }

  editDataSource() {

    this.revertMenu()
  }

  removeDataSource() {
    let index = this.dataSourceList.findIndex(value => value == this.dataSource)
    if(index != undefined)
      this.dataSourceList.splice(index, 1)
    this.revertMenu()
    this.currentDataSource.next(undefined)
  }
}
