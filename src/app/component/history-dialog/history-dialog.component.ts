import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatDialogRef} from "@angular/material/dialog";
import {
  MasterControlPropComponent
} from "../../module/admin/component/master-control-prop/master-control-prop.component";
import {BackendService} from "../../services/backend.service";
import {DocStat, DOCUMENT_NAME_LOAD_ERROR, ERROR} from "../../constants";
import {MessageService} from "../../services/message.service";
import {DocumentStatusEntity} from "../../model/DocumentStatusEntity";
import {DocStatusPipe} from "../../pipe/doc-status.pipe";
import {MatPaginator, MatPaginatorModule, PageEvent} from "@angular/material/paginator";
import {MatTableModule} from "@angular/material/table";
import {MatSort, MatSortModule} from "@angular/material/sort";
import {merge} from "rxjs";
import {map, startWith, switchMap} from "rxjs/operators";
import {FormsModule} from "@angular/forms";
import {DocStatus} from "../../interfaces/interfaces";

@Component({
  selector: 'app-history-dialog',
  standalone: true,
  imports: [CommonModule, DocStatusPipe, MatPaginatorModule, MatTableModule, MatSortModule, FormsModule],
  templateUrl: './history-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryDialogComponent implements OnInit, AfterViewInit {
  documentRef: number;
  displayedColumns: string[] = ['createDate', 'createUserName', 'status','statusText'];
  data: DocumentStatusEntity[] = []
  length = 100;
  pageSize = 100;
  pageSizeOptions = [100, 200, 300];
  private _docStatus: Partial<DocStat> = undefined

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  statusList:{status: string , name: string}[] = []


  constructor(
    public dialogRef: MatDialogRef<MasterControlPropComponent>,
    private backService: BackendService,
    private messageService: MessageService,
    private changeDetection: ChangeDetectorRef
  ) {
    this.statusList.push({status: "", name: ""})
    Object.keys(DocStatus).forEach((status, index) => {
      this.statusList.push({status: status, name: Object.values(DocStatus)[index]})
    })
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.paginator.firstPage();
    })

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          return this.backService.getDocumentStatusHistory(
            this.documentRef,
            this.paginator.pageIndex,
            this.paginator.pageSize,
            this.sort.active,
            this.sort.direction,
            this.docStatus
          )
        }),
        map(data => {
          if (data === null) {
            return [];
          }
          this.length = data.totalElements;
          return data.content as DocumentStatusEntity[];
        }),
      ).subscribe({
      next: data => {
        this.data = data
        this.changeDetection.detectChanges()
      },
      error: err => this.messageService.show(DOCUMENT_NAME_LOAD_ERROR, err.message, ERROR)
    })
  }

  refreshData() {
    this.docStatus = undefined
    this.initRefresh()
    this.changeDetection.detectChanges()
  }

  initRefresh() {
    let pgE = new PageEvent()
    pgE.pageIndex = 0
    pgE.pageSize = 100
    if(this.paginator)
      this.paginator.page.next(pgE)
  }


  ngOnInit(): void {
    this.refreshData()
  }


  get docStatus(): DocStat | undefined {
    return this._docStatus;
  }

  set docStatus(value: DocStat | undefined) {
    this._docStatus = value;
    this.initRefresh()
  }
}
