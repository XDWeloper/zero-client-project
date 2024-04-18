import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {IceDocumentMaket} from "../../../../interfaces/interfaces";
import {IWorker} from "../../../../workers/workerModel";
import {CdkDrag, CdkDragEnd} from "@angular/cdk/drag-drop";
import {FieldWorker} from "../../../../workers/FiedChangerWorker";
import {openDialog} from "../../util";
import {dialogCloseAnimationDuration, dialogOpenAnimationDuration} from "../../../../constants";
import {DataSourcePropertiesComponent} from "../data-source-properties/data-source-properties.component";
import {MatIconModule} from "@angular/material/icon";
import {CommonModule, NgClass, NgForOf, NgIf, NgStyle, NgTemplateOutlet} from "@angular/common";
import {WorkerPropertiesComponent} from "../worker-properties/worker-properties.component";

@Component({
  selector: 'app-worker-dialog',
  templateUrl: './worker-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconModule,
    CdkDrag,
    NgTemplateOutlet,
    NgClass,
    NgForOf,
    NgIf,
    NgStyle,
  ],
  standalone: true
})
export class WorkerDialogComponent {
  currentTemplate: IceDocumentMaket
  localWorkerList: IWorker[] = [];
  currentWorker: IWorker;
  workerMenuOpen: boolean = false;
  protected readonly menuDeltaX = 40;
  protected readonly menuDeltaY = 40;
  isMenuEnter: boolean = false;
  static isOpen = false


  constructor(
    public dialogRef: MatDialogRef<WorkerDialogComponent>,
    private dialog: MatDialog,
    private changeDetection: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.localWorkerList.push(...this.currentTemplate.docAttrib.workerList ?? [])
    WorkerDialogComponent.isOpen = true
  }


  add() {
    let nexId = this.getNextID()
    let newWork: IWorker = new FieldWorker(nexId,"Обработчик " + this.getNextID(), "FIELDCHANGER")
    newWork.position = {x:0,y:0}
    if (!newWork) return
    this.localWorkerList.push(newWork)
  }

  private getNextID(): number {
    return this.localWorkerList.length > 0 ? Math
      .max(...this.localWorkerList.map(value => value.id)) + 1 : 0
  }

  clearAll() {

  }

  openMenu($event: MouseEvent) {
    $event.preventDefault();
    this.revertMenu()
  }

  revertMenu() {
    this.workerMenuOpen = !this.workerMenuOpen
  }

  editWorker() {
    let dialogRef = openDialog(dialogOpenAnimationDuration, dialogCloseAnimationDuration, WorkerPropertiesComponent, this.dialog)
    dialogRef.componentInstance.currentWorker = this.currentWorker
    dialogRef.componentInstance.currentTemplate = this.currentTemplate
    dialogRef.afterClosed().subscribe(value => {
      if(value === 1){
        this.currentWorker = {...dialogRef.componentInstance.localWorker}
        let tmp = this.localWorkerList.findIndex(item => item.id === this.currentWorker.id)
        if(tmp != -1) {
          this.localWorkerList.splice(tmp, 1)
          this.localWorkerList.push(dialogRef.componentInstance.localWorker)
        }
        this.changeDetection.detectChanges()
      }
    })
  }

  dragEnd($event: CdkDragEnd) {
    this.currentWorker.position = $event.source.getFreeDragPosition()
  }

  workerLeave() {
    setTimeout(() => {
      this.workerMenuOpen = this.isMenuEnter
      if(!this.workerMenuOpen)
        this.currentWorker = undefined
      this.changeDetection.detectChanges()
    }, 100)

  }

  saveAndClose() {
    if (!this.currentTemplate.docAttrib.workerList)
      this.currentTemplate.docAttrib.workerList = []
    this.currentTemplate.docAttrib.workerList.splice(0, this.currentTemplate.docAttrib.workerList.length)
    this.currentTemplate.docAttrib.workerList.push(...this.localWorkerList)
    this.dialogRef.close(1)
  }

  removeWorker() {
    this.localWorkerList.splice(this.localWorkerList.findIndex(item => item.id === this.currentWorker.id), 1)
    this.revertMenu()
  }
}
