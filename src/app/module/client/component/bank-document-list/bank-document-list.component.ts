import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {BackendService} from "../../../../services/backend.service";
import {MessageService} from "../../../../services/message.service";
import {BANK_DOCUMENT_LOAD_ERROR, BANK_FILE_LOAD_ERROR, ERROR} from "../../../../constants";
import {BankFile} from "../../../../interfaces/interfaces";
import {HttpResponse} from "@angular/common/http";

@Component({
  selector: 'app-bank-document-list',
  templateUrl: './bank-document-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BankDocumentListComponent {
  documentRef: number
  data: BankFile[] = []
  displayedColumns: string[] = ['id', 'name', 'operation'];

  constructor(private dialogRef: MatDialogRef<BankDocumentListComponent>,
              private backService: BackendService,
              private messageService: MessageService,
              private changeDetection: ChangeDetectorRef) {
  }

  init() {
    /**Загружаем список*/
    this.backService.getBankFileList(this.documentRef).subscribe({
      next: res => {
        this.data = res
      },
      error: err => {
        this.messageService.show(BANK_DOCUMENT_LOAD_ERROR, err.error.message, ERROR)
      },
      complete: () => this.changeDetection.detectChanges()
    })
  }

  close() {
    this.dialogRef.close()
  }

  showDoc(file: BankFile) {
    this.backService.downloadFile(this.documentRef, file.id).subscribe({
      next: res => {
        this.downloadFile(res,file.fileName)
      },
      error: err => this.messageService.show(BANK_FILE_LOAD_ERROR, err.error.message, ERROR),
    })
  }

  downloadFile(data: Blob, fileName: string) {
    let binaryData = [];
    binaryData.push(data);
    let downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: 'blob' }));
    downloadLink.setAttribute('download', fileName);
    document.body.appendChild(downloadLink);
    downloadLink.click();
  }

}
