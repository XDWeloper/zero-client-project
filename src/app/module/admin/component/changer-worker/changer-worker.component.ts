import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ComponentFilterPipe} from "../../../../pipe/component-filter.pipe";
import {DataSourceFilterPipe} from "../../../../pipe/dataSource-filter.pipe";
import {FormsModule} from "@angular/forms";
import {IceInputComponent} from "../../../share-component/ice-input/ice-input.component";
import {MatIconModule} from "@angular/material/icon";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatTabsModule} from "@angular/material/tabs";
import {MatTooltipModule} from "@angular/material/tooltip";
import {FieldChangerWorker} from "../../../../workers/FiedChangerWorker";
import {IDataSource, IWorker} from "../../../../workers/workerModel";
import {IceDataSourceWorker} from "../../../../workers/IceDataSourceWorker";
import {IceDocumentMaket} from "../../../../interfaces/interfaces";

@Component({
  selector: 'app-changer-worker',
  standalone: true,
  imports: [CommonModule, ComponentFilterPipe, DataSourceFilterPipe, FormsModule, IceInputComponent, MatIconModule, MatSlideToggleModule, MatTabsModule, MatTooltipModule],
  templateUrl: './changer-worker.component.html',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class ChangerWorkerComponent {
  showWorkerProp: boolean;
  workerMenuPosition: any;
  workerMenuOpen: any;
  fieldChanger: FieldChangerWorker
  fieldChangerChanges: FieldChangerWorker

  @Input("worker")
  set FieldChanger(value: IWorker) {
    let newValue = value as FieldChangerWorker
    this.fieldChanger = newValue
    this.fieldChangerChanges = new FieldChangerWorker(newValue.id,newValue.name,"NETDATASOURCE")
  }

  @Input('currentTemplate') currentTemplate: IceDocumentMaket
  @Output('currentWorker') currentWorker = new EventEmitter<IWorker>()


  rightClick($event: MouseEvent) {
    $event.preventDefault();
    this.workerMenuPosition = {x: $event.x, y: $event.y}
    this.revertMenu()
  }

  revertMenu() {
    this.workerMenuOpen = !this.workerMenuOpen
  }

  editWorker() {

  }

  removeWorker() {

  }
}
