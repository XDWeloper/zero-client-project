import {Component, OnDestroy} from '@angular/core';
import {
  ComponentBound,
  ComponentMaket, ControlPropType, DialogButtonType,
  IceComponent,
  IceDocument, MasterControl,
  TextPosition,
  uploadFile
} from "../../../interfaces/interfaces";
import {ERROR, FILES_DELETE_ERROR, FILES_LOAD_ERROR, IceComponentType} from "../../../constants";
import {CellService} from "../../../services/cell.service";
import {ComponentService} from "../../../services/component.service";
import {BackendService} from "../../../services/backend.service";
import {MessageService} from "../../../services/message.service";
import {Subject, Subscription} from "rxjs";

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
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
  files = new Array<uploadFile>()
  sumSize: number = 0
  currentDocument: IceDocument
  private upload$: Subscription;
  private show$: Subject<DialogButtonType>;
  private deleteFileById$: Subscription;
  private delFiles$: Subject<DialogButtonType>;

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

    }

  get value(): any {
    return this._value;
  }

  set value(value: any) {
    this._value = value;
    if(value){
      let docArray = value as Array<uploadFile>
      docArray.forEach(doc => this.files.push(doc))
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
        console.log(control.toString())


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
    let filePool = file.target.files as Array<File>
    if(filePool != undefined && filePool.length > 0){
      this.upLoadFiles(filePool)
    }
  }

  deleteFile(index: number) {
    this.deleteFileById$ = this.backService.deleteFileById(this.files[index].id).subscribe({
      next: (res => {
        this.files.splice(index,1)
      }),
      error: (err => this.delFiles$ = this.messageService.show(FILES_DELETE_ERROR, err.message, ERROR))
    })

  }

  private upLoadFiles(files: Array<File>) {
    //this.files.splice(0,this.files.length)
    const formData: FormData = new FormData();
    for (let file of files) {
      formData.append("file", file)
      formData.append("documentRef", this.currentDocument.id.toString());
      formData.append("fileName", file.name);
      formData.append("fileType", file.type);

      this.upload$ = this.backService.upload(formData).subscribe({
        next: (res => {
          this.files.push(res)
          this.componentService.setComponentValue({componentId: this.componentID, value: this.files})
        }),
        error: (err => {
            this.show$ = this.messageService.show(FILES_LOAD_ERROR, err.message, ERROR)
          }
        )
      })
      formData.delete("file")
      formData.delete("documentRef")
      formData.delete("fileName")
      formData.delete("fileType")
    }
  }

}
