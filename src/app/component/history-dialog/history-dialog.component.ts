import {AfterViewInit, Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatDialogRef} from "@angular/material/dialog";
import {
  MasterControlPropComponent
} from "../../module/admin/component/master-control-prop/master-control-prop.component";
import {BackendService} from "../../services/backend.service";
import {DOCUMENT_REMOVE_ERROR, ERROR, GET_DOCUMENT_STATUS_HISTORY_ERROR} from "../../constants";
import {MessageService} from "../../services/message.service";

@Component({
  selector: 'app-history-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history-dialog.component.html',
  styleUrls: ['./history-dialog.component.css']
})
export class HistoryDialogComponent implements OnInit{
  documentRef: number;




  constructor(
    public dialogRef: MatDialogRef<MasterControlPropComponent>,
    private backService: BackendService,
    private messageService: MessageService
  ) {
    console.log("constructor", this.documentRef)
  }

  ngOnInit(): void {
    if(this.dialogRef)
      this.loadData()
  }

  loadData(){
    this.backService.getDocumentStatusHistory(this.documentRef,0,100,"createDate","asc").subscribe({
      next: value => {
        console.log(value)
      },
      error: err => {
        this.messageService.show(GET_DOCUMENT_STATUS_HISTORY_ERROR, err.error.message, ERROR)
      }
    })
  }


}
