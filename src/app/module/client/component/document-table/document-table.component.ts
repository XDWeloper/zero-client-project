import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {BackendService} from "../../../../services/backend.service";
import {IceDocument, OpenDocType} from "../../../../interfaces/interfaces";
import {
  dialogCloseAnimationDuration,
  dialogOpenAnimationDuration,
  DOCUMENT_NAME_LOAD_ERROR,
  DOCUMENT_REMOVE_ERROR,
  ERROR, MESSAGE_NO_DOCUMENT,
  TAB_DOCUMENT_LIST,
  TAB_DOCUMENT_SHOW
} from "../../../../constants";
import {MessageService} from "../../../../services/message.service";
import {TabService} from "../../../../services/tab.service";
import {merge } from 'rxjs';
import {map, startWith, switchMap} from 'rxjs/operators';
import {animate, style, transition, trigger} from "@angular/animations";
import {BankDocumentListComponent} from "../bank-document-list/bank-document-list.component";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {HistoryDialogComponent} from "../../../../component/history-dialog/history-dialog.component";
import {ComponentType} from "@angular/cdk/overlay";
import {DocumentService} from "../../../../services/document.service";

@Component({
  selector: 'app-document-table',
  templateUrl: './document-table.component.html',
  styleUrls: ['./document-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class DocumentTableComponent implements AfterViewInit, OnInit {
  displayedColumns: string[] = ['id', 'docName', 'createDate', 'status','statusDate', 'document', 'operation'];
  data: IceDocument[] = []
  length = 50;
  pageSize = 10;
  pageSizeOptions = [10, 25, 50];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Output()
  openDocId = new EventEmitter<{"rowId": number, "openType": OpenDocType}>()
  step: number;
  filterExpanded = false
  docName: string
  createDate: Date
  docStatus: string
  statusList:{status: string , name: string}[] = []
  private _isOpenedTab: boolean = false
  private _isMaketExist: boolean = true

  @Input() set isOpenedTab(value: boolean) {
    // if(value === true)
    //   this.refreshData()
    this._isOpenedTab = value
  }
  @Input() set isMaketExist(value: boolean){
    console.log("isMaketExist", value)
    this._isMaketExist = value
  }

  get isMaketExist(): boolean {
    return this._isMaketExist;
  }

  get isOpenedTab(): boolean {
    return this._isOpenedTab
  }

  constructor(public backService: BackendService,
              private messageService: MessageService,
              private tabService: TabService,
              public dialog: MatDialog,
              private changeDetection: ChangeDetectorRef,
              private documentService: DocumentService) {
  }


  ngOnInit(): void {
    this.statusList = this.documentService.getStatusListForSelect()
    this.tabService.onTabChanged().subscribe(tabNum => {
      if (tabNum === TAB_DOCUMENT_LIST)
        this.refreshData()
    })

  }

  clearFilter() {
    this.docName = undefined
    this.createDate = undefined
    this.docStatus = undefined
    this.changeDetection.detectChanges()
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
          )//.pipe(catchError(() => observableOf(null)));
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
        if(data.length < 1)
          this.messageService.show(MESSAGE_NO_DOCUMENT, "", "INFO")

        this.changeDetection.detectChanges()
      },
      error: err => this.messageService.show(DOCUMENT_NAME_LOAD_ERROR, err.error.message, ERROR)
    })

  }

  applyFilter() {
    this.initRefresh()
  }

  editDoc(row: IceDocument) {
    this.openDocId.next({rowId: row.id,openType: "EDIT"})
  }

  onInfoClick(statusText: string) {
    this.messageService.show("Информация о статусе документа", statusText, "INFO")
  }

  removeDoc(id: number) {
    this.messageService.show("Вы действительно хотите удалить документ?", "Это действие приведет к безвозвратному удалению документа", "INFO", ["YES", "NO"])
      .subscribe({
        next: res => {
          if (res === "YES") {
            this.backService.removeDocument(id).subscribe({
              next: ((res) => {
                this.refreshData()
                /**Если документ открыт в редакторе, то сбросить*/
                // if(DocumentEditorComponent.instance.currentDocument && id === DocumentEditorComponent.instance.currentDocument.id)
                //   DocumentEditorComponent.instance.currentDocument = undefined
              }),
              error: ((err) => this.messageService.show(DOCUMENT_REMOVE_ERROR, err.error.message, ERROR))
            })
          }
        }
      })

  }

  refreshData() {
    this.clearFilter()
    this.initRefresh()
    this.filterExpanded = false
    this.changeDetection.detectChanges()
  }

  initRefresh() {
    let pgE = new PageEvent()
    pgE.pageIndex = 0
    pgE.pageSize = 10
    this.paginator.page.next(pgE)
  }

  showDownloadedFile(id: number) {
    let componentRef = this.openDialog(BankDocumentListComponent,dialogOpenAnimationDuration, dialogCloseAnimationDuration, id)
    componentRef.componentInstance.documentRef = id
    componentRef.componentInstance.init()

  }

  openDialog<T>(component: ComponentType<T>, enterAnimationDuration: string, exitAnimationDuration: string, documentRef: number): MatDialogRef<T> {
    return  this.dialog.open(component, {
      width: '' + (window.innerWidth * 0.8) + 'px',
      height: '' + (window.innerHeight * 0.8) + 'px',
      enterAnimationDuration,
      exitAnimationDuration,
    })
  }


  showDoc(row: IceDocument) {
    this.openDocId.next({rowId: row.id,openType: "VIEW"})
  }

  openHistoryDialog(id: number) {
    let componentRef = this.openDialog(HistoryDialogComponent,dialogOpenAnimationDuration, dialogCloseAnimationDuration, id)
    componentRef.componentInstance.documentRef = id
  }


  openDocEditor() {
    this.tabService.openTab(TAB_DOCUMENT_SHOW)
  }
}
