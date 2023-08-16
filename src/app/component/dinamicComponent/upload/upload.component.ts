import {Component, OnDestroy} from '@angular/core';
import {
  BankFile,
  ComponentBound,
  ComponentMaket, ControlPropType, DialogButtonType,
  IceComponent,
  IceDocument, MasterControl,
  TextPosition,
  UploadFile
} from "../../../interfaces/interfaces";
import {
  BANK_FILE_LOAD_ERROR, DOCUMENT_DRAFT_SAVED, DOCUMENT_SAVE_ERROR, DOCUMENT_SEND,
  ERROR,
  FILE_SIZE_ERROR,
  FILES_DELETE_ERROR,
  FILES_LOAD_ERROR,
  IceComponentType
} from "../../../constants";
import {CellService} from "../../../services/cell.service";
import {ComponentService} from "../../../services/component.service";
import {BackendService} from "../../../services/backend.service";
import {MessageService} from "../../../services/message.service";
import {find, Subject, Subscription} from "rxjs";
import {environment} from "../../../../environments/environment";

const size1mb = 1048576

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html'
})
export class UploadComponent implements IceComponent, OnDestroy{
  masterControlList: MasterControl[];

  cellNumber: number;
  componentBound: ComponentBound;
  componentID: number;
  componentName: string;
  componentType: IceComponentType;
  correctX: number;
  correctY: number;
  frameColor: string | undefined;
  inputType: string;
  maxLength: number | undefined;
  maxVal: number | undefined;
  minLength: number | undefined;
  minVal: number | undefined;
  notification: string | undefined;
  placeHolder: string;
  regExp: string | undefined;
  required: boolean;
  stepNum: number;
  textPosition: TextPosition;
  private _value: any;

  height: any;
  width: any;
  top: any;
  left: any;
  files = new Array<UploadFile>()
  sumSize: number = 0
  currentDocument: IceDocument
  private upload$: Subscription;
  private show$: Subject<DialogButtonType>;
  private deleteFileById$: Subscription;
  private delFiles$: Subject<DialogButtonType>;
  private updateDocument$: Subscription;

  private changeValue$: Subscription
  enabled = true
  visible = true



  constructor(private cellService: CellService,
              private componentService: ComponentService,
              private backService: BackendService,
              private messageService: MessageService) {
  }

  ngOnDestroy(): void {
    if(this.upload$)
      this.upload$.unsubscribe()
    if(this.show$)
      this.show$.unsubscribe()
    if(this.deleteFileById$)
      this.deleteFileById$.unsubscribe()
    if(this.delFiles$)
      this.delFiles$.unsubscribe()
    if (this.updateDocument$)
      this.updateDocument$.unsubscribe()
    }

  get value(): any {
    return this._value;
  }

  set value(value: any) {
    this._value = value;
    console.log(value)
    if(value){
      let docArray = value as Array<UploadFile>
      docArray.forEach(doc => this.files.push(doc))
      this.reCalculateSumSize()
    }
  }

  reCalculateSumSize(){
    if(this.files.length > 0){
      this.sumSize = this.files.map(f => f.size).reduce((x, y) => x + y) / size1mb
      this.sumSize = Number(this.sumSize.toFixed(2))
    }
  }

  ngOnInit(): void {
    this.height = this.cellService.getClientCellHeight() * this.componentBound.heightScale
    this.width =  this.cellService.getClientCellWidth() * this.componentBound.widthScale
    this.left =   this.cellService.getClientCellBound(this.cellNumber).x - this.correctX
    this.top =    this.cellService.getClientCellBound(this.cellNumber).y - this.correctY

    this.propControl()
  }

  private propControl() {
    this.changeValue$ = this.componentService.changeValue$.subscribe(item => {
      let componentId = item.componentId
      let value = item.value
      if (componentId === this.componentID || value === undefined) return

      if (this.masterControlList) {
        let control: ControlPropType = this.masterControlList.filter(c => c.componentID === componentId).find(c => c.componentValue === value).controlProp
        switch (control.toString()) {
          case "DISABLED":
            this.enabled = false;
            break;
          case "ENABLED":
            this.enabled = true;
            break;
          case "INVISIBLE":
            this.visible = false;
            break;
          case "VISIBLE":
            this.visible = true;
            break;
        }
      }
    })
  }

  getFile(file: any) {
    let filePool:Array<File> = file.target.files as Array<File>
    if([...filePool].find(f => f.size > 1000000) != undefined){
      this.messageService.show(FILE_SIZE_ERROR, "Размер файла не должен превышать 1мб. \n Файлы большего размера загружены не будут.", ERROR)
    }
    filePool = [...filePool].filter(f => f.size < 1000000)
    if(filePool != undefined && filePool.length > 0){
      this.upLoadFiles(filePool)
    }
  }

  deleteFile(index: number) {
    this.deleteFileById$ = this.backService.deleteFileById(this.files[index].id,this.currentDocument.id.toString()).subscribe({
      next: (res => {
        this.files.splice(index,1)
        this.componentService.setComponentValue({componentId: this.componentID, value: this.files})
      }),
      error: (err => {
          this.delFiles$ = this.messageService.show(FILES_DELETE_ERROR, err.error.message, ERROR)
      })
    })

  }

  private upLoadFiles(files: Array<File>) {
    const formData: FormData = new FormData();
    for (let file of files) {
      formData.append("file", file)
      formData.append("documentRef", this.currentDocument.id.toString());
      formData.append("fileName", file.name);
      formData.append("fileType", file.type);
      formData.append("url", environment.resourceServerURL + "/core/files");

      this.upload$ = this.backService.upload(formData).subscribe({
        next: (res => {
          this.files.push(res)
          this.reCalculateSumSize()
          this.componentService.setComponentValue({componentId: this.componentID, value: this.files})
        }),
        error: (err => {
            this.show$ = this.messageService.show(FILES_LOAD_ERROR, err.error.message, ERROR)
          }
        )
      })
      formData.delete("file")
      formData.delete("documentRef")
      formData.delete("fileName")
      formData.delete("fileType")
      formData.delete("url")
    }
    console.log(this.files)
  }

  showDoc(file: UploadFile) {
    this.backService.downloadFile(this.currentDocument.id, file.id).subscribe({
      next: res => {
        this.downloadFile(res,file.name)
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

  // saveDoc(){
  //   this.updateDocument$ = this.backService.updateDocument(this.currentDocument).subscribe({
  //     error: (err => this.messageService.show(DOCUMENT_SAVE_ERROR, err.error.message, ERROR))
  //   })
  // }

}
