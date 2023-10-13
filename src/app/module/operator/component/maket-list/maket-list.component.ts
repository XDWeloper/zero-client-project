import {AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {ResponseTree} from "../../../../interfaces/interfaces";
import {BackendService} from "../../../../services/backend.service";
import {ERROR, MAKET_NAME_LOAD_ERROR} from "../../../../constants";
import {MessageService} from "../../../../services/message.service";

@Component({
  selector: 'app-maket-list',
  templateUrl: './maket-list.component.html',
  styleUrls: ['./maket-list.component.css']
})
export class MaketListComponent implements AfterViewInit, OnInit{
  displayedColumns: string[] = ['id', 'name'];
  data: MatTableDataSource<ResponseTree>
  resultsLength:number
  pageSize: number

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Output()
  selectedMaket: EventEmitter<number> = new EventEmitter<number>()

  constructor(private backendService: BackendService, private errorService: MessageService) {
    this.loadMaketNameList()
  }

  loadMaketNameList() {
    this.backendService.getMaketNameList().subscribe(
      {
        next: ((res) => {
          let respTree = res.content as ResponseTree[]

         this.data = new MatTableDataSource<ResponseTree>(respTree)
          this.resultsLength = res.totalElements
          this.pageSize = res.size
          this.data.paginator = this.paginator;
          this.data.sort = this.sort;

        }),
        error: ((err) => {
          this.errorService.show(MAKET_NAME_LOAD_ERROR,err.message, ERROR)
        })
      }
    )
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.paginator._intl.itemsPerPageLabel = "размер страницы"
    this.sort.sortChange.subscribe((s) => {
      this.data.paginator.firstPage();
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.data.filter = filterValue.trim().toLowerCase();

    if (this.data.paginator) {
      this.data.paginator.firstPage();
    }
  }


  selectMaket(id: number) {
    this.selectedMaket.next(id)
  }

  // handleFileSelect(evt: any) {
  //   var files = evt.target.files;
  //   var f = files[0];
  //   var reader = new FileReader();
  //   reader.readAsText(f);
  //   reader.onload = (f => {
  //     return e => {
  //       // @ts-ignore
  //       let docList: IceDocumentMaket[] = JSON.parse(e.target.result)
  //       this.documentService.setTemplateList(docList)
  //       this.selectMaket(docList[0].docId)
  //     };
  //   })(f);
  // }
}
