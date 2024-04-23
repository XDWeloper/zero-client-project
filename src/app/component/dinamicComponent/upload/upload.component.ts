import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {
  ComponentBound,
  ComponentInputType,
  ComponentRuleForPDF,
  ControlPropType,
  DialogButtonType,
  IceComponent,
  IceDocument,
  IceEvent,
  MasterControl,
  OptionList,
  TableProperties,
  TextPosition,
  UploadFile
} from "../../../interfaces/interfaces";
import {
  AlertColor,
  BANK_FILE_LOAD_ERROR,
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
import {Subject, Subscription} from "rxjs";
import {environment} from "../../../../environments/environment";
import {SpinnerService} from "../../../services/spinner.service";
import {HttpEventType} from "@angular/common/http";
import {StepService} from "../../../services/step.service";

const fileSize1mb = 1048576

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadComponent implements IceComponent, OnDestroy {
  masterControlList: MasterControl[];

  cellNumber: number;
  componentBound: ComponentBound;
  componentID: number;
  componentName: string;
  componentType: IceComponentType;
  correctX: number;
  correctY: number;
  frameColor: string | undefined;
  inputType: ComponentInputType;
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
  localBorderColor: string

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
  private allFilesIsUpLoaded$ = new Subject();
  printRule: ComponentRuleForPDF;

  private changeValue$: Subscription
  enabled = true
  visible = true

  private maxFilesizeKb = 7340032
  maxFilesizeString = "Максимальный размер файла не должен превышать: 7мб."

  isUpload = false


  private coreEnvironment: any


  constructor(private cellService: CellService,
              private componentService: ComponentService,
              private backService: BackendService,
              private messageService: MessageService,
              private changeDetection: ChangeDetectorRef,
              private spinnerService: SpinnerService,
              private stepService: StepService) {
  }

  tableProp?: TableProperties;
  componentEvent?: IceEvent[];

  update(): void {
    throw new Error('Method not implemented.');
  }

  tableType: number;
  checkedText?: string;
  optionList?: OptionList[] | undefined

  ngOnDestroy(): void {
    if (this.upload$)
      this.upload$.unsubscribe()
    if (this.show$)
      this.show$.unsubscribe()
    if (this.deleteFileById$)
      this.deleteFileById$.unsubscribe()
    if (this.delFiles$)
      this.delFiles$.unsubscribe()
    if (this.updateDocument$)
      this.updateDocument$.unsubscribe()
    if (this.allFilesIsUpLoaded$)
      this.allFilesIsUpLoaded$.unsubscribe()
  }

  get value(): any {
    return this._value;
  }

  set value(value: any) {
    this._value = value;

    this.setFrameColor()

    if (value) {
      let docArray = value as Array<UploadFile>
      docArray.filter(f => f.id).forEach(doc => this.files.push(doc))
      this.reCalculateSumSize()
    }
  }

  reCalculateSumSize() {
    if (this.files.length > 0) {
      let size = this.files.map(f => f.size).reduce((x, y) => x + y) / fileSize1mb
      this.sumSize = Number(size.toFixed(2))
    }

    this.setFrameColor()
    this.changeDetection.detectChanges()
  }

  private setFrameColor(){
    this.localBorderColor = this.files.length === 0 && this.required ? AlertColor : this.frameColor
  }

  ngOnInit(): void {
    this.height = this.cellService.getClientCellHeight() * this.componentBound.heightScale
    this.width = this.cellService.getClientCellWidth() * this.componentBound.widthScale
    this.left = this.cellService.getClientCellBound(this.cellNumber).x - this.correctX
    this.top = this.cellService.getClientCellBound(this.cellNumber).y - this.correctY

    // this.backService.getCoreEnvironment().subscribe({
    //   next: res => console.log(res)
    // })

    this.propControl()
    this.changeDetection.detectChanges()
    this.allFilesIsUpLoaded$.subscribe({
      next: res => {
        this.isUpload = false
        this.stepService.disabledAllStep(false)
        this.changeDetection.detectChanges()
      }
    })
  }

  private propControl() {
    this.changeValue$ = this.componentService.changeValue$.subscribe(item => {
      let componentId = item.componentId
      let value = item.value
      if (componentId === this.componentID || value === undefined) return

      if (this.masterControlList && this.masterControlList.length > 0) {
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
    let filePool: Array<File> = file.target.files as Array<File>
    if ([...filePool].find(f => f.size > this.maxFilesizeKb) != undefined) {
      this.messageService.show(FILE_SIZE_ERROR, "Размер файла не должен превышать 7мб. \n Файлы большего размера загружены не будут.", ERROR)
    }
    filePool = [...filePool].filter(f => f.size < this.maxFilesizeKb)
    if (filePool != undefined && filePool.length > 0) {
      this.upLoadFiles(filePool)
    }
  }

  deleteFile(index: number) {
    this.isUpload = true
    this.stepService.disabledAllStep(true)
    let fileId = this.files[index].id
    this.files[index].id = undefined
    this.deleteFileById$ = this.backService.deleteFileById(fileId, this.currentDocument.id.toString()).subscribe({
      next: (res => {
        this.spinnerService.hide()
        if (res.type === HttpEventType.Response) {
          this.files.splice(index, 1)
          this.componentService.setComponentValue({componentId: this.componentID, value: this.files})
          this.isUpload = false
          this.stepService.disabledAllStep(false)
          this.reCalculateSumSize()
        }
      }),
      error: (err => {
        this.files[index].id = fileId
        this.delFiles$ = this.messageService.show(FILES_DELETE_ERROR, err.error.message, ERROR)
        this.stepService.disabledAllStep(false)
        this.isUpload = false
        this.changeDetection.detectChanges()
      })
    })

  }

  private upLoadFiles(files: Array<File>) {
    this.isUpload = true
    let fileCont = 0
    const formData: FormData = new FormData();
    files.forEach((file, index) => {
      formData.append("file", file)
      formData.append("documentRef", this.currentDocument.id.toString());
      formData.append("fileName", file.name);
      formData.append("fileType", file.type);
      formData.append("url", environment.resourceServerURL + "/core/files");

      this.upload$ = this.backService.upload(formData)
        .subscribe({
          next: (res => {
            this.spinnerService.hide()
            this.stepService.disabledAllStep(true)
            let fileName = file.name

            if (res.type === HttpEventType.Sent) {
              let file: UploadFile = {id: undefined, name: fileName, size: 0, status: "", progress: 0}
              this.files.push(file)
              this.reCalculateSumSize()
              this.componentService.setComponentValue({componentId: this.componentID, value: this.files})
            }

            if (res.type === HttpEventType.Response) {
              res = res.body
              let file: UploadFile = {id: res.id, name: res.name, size: res.fileSize, status: res.status}
              this.files.splice(this.files.findIndex(i => i.id === undefined), 1)
              this.files.push(file)
              this.reCalculateSumSize()
              this.componentService.setComponentValue({componentId: this.componentID, value: this.files})
              if (files.length === ++fileCont) {
                this.allFilesIsUpLoaded$.next(true)
              }
            }
          }),
          error: (err => {
              let errorFileIndex = this.files.findIndex(f => f.id === undefined)
              let message = undefined
              if (errorFileIndex != -1) {
                let errorFile = this.files[errorFileIndex]
                message = `Ошибка загрузки файла ${errorFile.name}. Смотри доп. информацию.(Кликни на иконку информации.)`
                this.files.splice(errorFileIndex, 1)
              }
              this.show$ = this.messageService.show(message ? message : FILES_LOAD_ERROR, err.error.message, ERROR)
              this.reCalculateSumSize()
              this.stepService.disabledAllStep(false)
              this.isUpload = false
              this.changeDetection.detectChanges()
            }
          )
        })
      formData.delete("file")
      formData.delete("documentRef")
      formData.delete("fileName")
      formData.delete("fileType")
      formData.delete("url")
    })
  }

  showDoc(file: UploadFile) {
    this.backService.downloadFile(this.currentDocument.id, file.id).subscribe({
      next: res => {
        this.downloadFile(res, file.name)
      },
      error: err => this.messageService.show(BANK_FILE_LOAD_ERROR, err.error.message, ERROR),
    })
  }

  downloadFile(data: Blob, fileName: string) {
    let binaryData = [];
    binaryData.push(data);
    let downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: 'blob'}));
    downloadLink.setAttribute('download', fileName);
    document.body.appendChild(downloadLink);
    downloadLink.click();
  }

}
