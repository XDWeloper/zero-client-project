import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IceDocumentMaket} from "../../../../interfaces/interfaces";
import {ChangeWorkerComponent} from "../change-worker/change-worker.component";
import {MatIconModule} from "@angular/material/icon";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {IDataSource} from "../../../../workers/workerModel";
import {CdkDrag, CdkDragEnd} from "@angular/cdk/drag-drop";
import {IceDataSource} from "../../../../workers/IceDataSource";
import {DataSourceFilterPipe} from "../../../../pipe/dataSource-filter.pipe";
import {IceInputComponent} from "../../../share-component/ice-input/ice-input.component";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatTabsModule} from "@angular/material/tabs";
import {MatTooltipModule} from "@angular/material/tooltip";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {openDialog} from "../../util";
import {DataSourcePropertiesComponent} from "../data-source-properties/data-source-properties.component";
import {dialogCloseAnimationDuration, dialogOpenAnimationDuration} from "../../../../constants";


@Component({
  selector: 'app-data-sourse-dialog',
  standalone: true,
  imports: [CommonModule, ChangeWorkerComponent, MatIconModule, CdkDrag, DataSourceFilterPipe, IceInputComponent, MatSlideToggleModule, MatTabsModule, MatTooltipModule, ReactiveFormsModule, FormsModule],
  templateUrl: './data-source-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataSourceDialogComponent implements OnInit {
  currentTemplate: IceDocumentMaket
  localDataSourceList: IDataSource[] = [];
  currentDataSource: IDataSource;
  dataSourceMenuOpen: boolean = false;
  protected readonly menuDeltaX = 40;
  protected readonly menuDeltaY = 40;
  isMenuEnter: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DataSourceDialogComponent>,
    private dialog: MatDialog,
    private changeDetection: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.localDataSourceList.push(...this.currentTemplate.docAttrib.dataSourceList ?? [])
  }

  clearAllEvent() {

  }

  saveAndClose() {
    if (!this.currentTemplate.docAttrib.dataSourceList)
      this.currentTemplate.docAttrib.dataSourceList = []
    this.currentTemplate.docAttrib.dataSourceList.splice(0, this.currentTemplate.docAttrib.dataSourceList.length)
    this.currentTemplate.docAttrib.dataSourceList.push(...this.localDataSourceList)
    this.dialogRef.close(1)
  }

  add() {
    let nexId = this.getDataSourceNextID()
    let newDs: IceDataSource = new IceDataSource(
      nexId,
      "Источник данных " + this.getDataSourceNextID())
    newDs.position = {x:0,y:0}
    if (!newDs) return
    this.localDataSourceList.push(newDs)
  }

  private getDataSourceNextID(): number {
    return this.localDataSourceList.length > 0 ? Math
      .max(...this.localDataSourceList.map(value => value.id)) + 1 : 0
  }

  clearAll() {

  }

  dragEnd($event: CdkDragEnd) {
      this.currentDataSource.position = $event.source.getFreeDragPosition()
  }

  openMenu($event: MouseEvent) {
    $event.preventDefault();
    this.revertMenu()
  }

  revertMenu() {
    this.dataSourceMenuOpen = !this.dataSourceMenuOpen
  }

  editDataSource() {
    let dialogRef = openDialog(dialogOpenAnimationDuration, dialogCloseAnimationDuration, DataSourcePropertiesComponent, this.dialog)
    dialogRef.componentInstance.currentDataSource = this.currentDataSource
    dialogRef.componentInstance.currentTemplate = this.currentTemplate
    dialogRef.afterClosed().subscribe(value => {
      if(value === 1){
        console.log(dialogRef.componentInstance.localDataSource)
        this.currentDataSource = {...dialogRef.componentInstance.localDataSource}
        console.log(this.currentDataSource)
        let tmp = this.localDataSourceList.findIndex(item => item.id === this.currentDataSource.id)
        if(tmp != -1) {
          this.localDataSourceList.splice(tmp, 1)
          this.localDataSourceList.push(dialogRef.componentInstance.localDataSource)
        }
        this.changeDetection.detectChanges()
      }
    })

  }

  removeDataSource() {
    this.localDataSourceList.splice(this.localDataSourceList.findIndex(item => item.id === this.currentDataSource.id), 1)
    this.revertMenu()
  }

  dsLeave() {
    setTimeout(() => {
      this.dataSourceMenuOpen = this.isMenuEnter
      if(!this.dataSourceMenuOpen)
        this.currentDataSource = undefined
      this.changeDetection.detectChanges()
    }, 100)
  }
}
