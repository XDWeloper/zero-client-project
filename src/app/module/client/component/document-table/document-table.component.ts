import {AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {BackendService} from "../../../../services/backend.service";
import {IceDocument} from "../../../../interfaces/interfaces";
import {DOCUMENT_NAME_LOAD_ERROR, DOCUMENT_REMOVE_ERROR, ERROR, TAB_DOCUMENT_LIST} from "../../../../constants";
import {MessageService} from "../../../../services/message.service";
import {TabService} from "../../../../services/tab.service";
import {merge, of as observableOf} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-document-table',
  templateUrl: './document-table.component.html',
  styleUrls: ['./document-table.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateY(-100%)'}),
        animate('200ms ease-in', style({transform: 'translateY(0%)'}))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({transform: 'translateY(-100%)'}))
      ])
    ])
  ]
})
export class DocumentTableComponent implements AfterViewInit, OnInit{
  displayedColumns: string[] = ['id', 'docName', 'createDate', 'status', 'document','operation'];
  data: IceDocument[] = []
  length = 50;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Output()
  openDocId = new EventEmitter<number>()
  step: number;
  filterExpanded = false
  docName: string
  createDate: Date
  docStatus: string


  constructor(public backService: BackendService, private messageService: MessageService, tabService: TabService) {
    tabService.onTabChanged().subscribe(tabNum => {
      if(tabNum === TAB_DOCUMENT_LIST)
        this.refreshData()
    })
  }
  ngOnInit(): void {
    }

    clearFilter(){
      this.docName = undefined
      this.createDate = undefined
      this.docStatus = undefined
    }


  ngAfterViewInit(): void {
    this.paginator._intl.itemsPerPageLabel = "размер страницы"

    this.sort.sortChange.subscribe((s) => {
      this.paginator.firstPage();
    })

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          return this.backService.getDocumentNameList(
            this.paginator.pageIndex,
            this.paginator.pageSize,
            this.sort.active,
            this.sort.direction,
            this.docName,
            this.createDate,
            this.docStatus
          ).pipe(catchError(() => observableOf(null)));
        }),
        map(data => {
          if (data === null) {
            return [];
          }
          this.length = data.totalElements;
          return data.content;
        }),
      ).subscribe({
      next: data => {
          this.data = data
      },
      error: err => this.messageService.show(DOCUMENT_NAME_LOAD_ERROR,err.message, ERROR)
    })

  }

  applyFilter() {
    this.initRefresh()
  }

  editDoc(row: IceDocument) {
    this.openDocId.next(row.id)
  }

  onInfoClick(statusText: string) {
    this.messageService.show("Информация о статусе документа",statusText, "INFO")
  }

  removeDoc(id: number) {
    this.messageService.show("Вы действительно хотите удалить документ?","Это действие приведет к безвозвратному удалению документа", "INFO", ["YES","NO"])
      .subscribe({
        next: res => {
          if(res === "YES"){
            this.backService.removeDocument(id).subscribe({
              next: ((res) => {
                this.refreshData()
              }),
              error: ((err) => this.messageService.show(DOCUMENT_REMOVE_ERROR,err.message, ERROR))
            })
          }
        }
      })

  }

  refreshData() {
    this.clearFilter()
    this.initRefresh()
    this.filterExpanded = false
  }

  initRefresh(){
    let pgE = new PageEvent()
    pgE.pageIndex = 0
    pgE.pageSize = 10
    this.paginator.page.next(pgE)
  }

}
