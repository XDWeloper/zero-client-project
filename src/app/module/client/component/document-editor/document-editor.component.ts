import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {
  ComponentMaket,
  EventObject,
  IceComponent,
  IceDocument,
  IceStepMaket,
  OpenDocType
} from "../../../../interfaces/interfaces";
import {
  cellColl,
  cellRow,
  CellType,
  CHANGE_STATUS_ERROR,
  CHANGE_STATUS_TO_DRAFT,
  CHANGE_STATUS_TO_SENDING,
  collInRow,
  dialogCloseAnimationDuration,
  dialogOpenAnimationDuration,
  DocStat,
  DOCUMENT_DRAFT_SAVED,
  DOCUMENT_SAVE_ERROR,
  DOCUMENT_SEND,
  DRAFT_SAVE_ERROR,
  ERROR,
  IceComponentType,
  INFO,
  MAKET_LOAD_ERROR,
  MESSAGE_REPORT_IN_PROCESS,
  MESSAGE_REPORT_IS_DONE,
  TAB_DOCUMENT_LIST
} from "../../../../constants";
import {TextComponent} from "../../../../component/dinamicComponent/text/text.component";
import {InputComponent} from "../../../../component/dinamicComponent/input/input.component";
import {AreaComponent} from "../../../../component/dinamicComponent/area/area.component";
import {
  InformationMainCounterpartiesTableComponent
} from "../../../../component/dinamicComponent/tables/information-main-counterparties-table/information-main-counterparties-table.component";
import {
  InformationCompanyParticipantsTableComponent
} from "../../../../component/dinamicComponent/tables/information-company-participants-table/information-company-participants-table.component";
import {BehaviorSubject, debounceTime, filter, interval, Observable, Subject, Subscription} from "rxjs";
import {ComponentService} from "../../../../services/component.service";
import {BackendService} from "../../../../services/backend.service";
import {MessageService} from "../../../../services/message.service";
import {TabService} from "../../../../services/tab.service";
import {UploadComponent} from "../../../../component/dinamicComponent/upload/upload.component";
import {AddressComponent} from "../../../../component/dinamicComponent/adress/address.component";
import {SelectComponent} from "../../../../component/dinamicComponent/select/select.component";
import {StepService} from "../../../../services/step.service";
import {StatusReasonComponent} from "../../../../component/status-reason/status-reason.component";
import {MatDialog} from "@angular/material/dialog";
//import {PDFDocObject, PrintService} from "../../../../services/print.service";
//import {AnketaScriptRule} from "../../../../data/anketaScriptRule";
import {TableComponent} from "../../../../component/dinamicComponent/tables/table/table.component";
import {EventService} from "../../../../services/event.service";
import {WorkerService} from "../../../../services/worker.service";
import {DataSourceService} from "../../../../services/data-source.service";
import {TimeService} from "../../../../services/time.service";

@Component({
  selector: 'app-document-editor',
  templateUrl: './document-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentEditorComponent implements AfterViewChecked, OnDestroy, OnInit {
  steps: IceStepMaket[] = new Array()
  private _editDocId: number
  private _currentDocument: IceDocument
  private getMaketFull$: Subscription;
  private createDocument$: Subscription;
  private updateDocument$: Subscription;
  private tabLabelNode: HTMLElement
  private _openType: OpenDocType = "EDIT"
  private _isOpenedTab: boolean = false
  private defaultDebounce = 500
  private currentDebounce = 500
  private isResize = false
  reportProcessUID: string | undefined = undefined
  reportInterval$: Subscription
  savedIsDone$ =   new Subject<boolean>()
  isSavedForPrint = false

  @Input() maketId: number | undefined

  @Input() set isOpenedTab(value: boolean) {
    if (value === false)
      this.currentDocument = undefined

    this._isOpenedTab = value

    if (value === true && this.maketId && !this.currentDocument) {
      this._isOpenedTab = false
      this.loadDocMaket(this.maketId)
    }
  }

  static instance: DocumentEditorComponent

  get isOpenedTab(): boolean {
    return this._isOpenedTab
  }

  @Input() set currentDocument(value: IceDocument | undefined) {
    //console.log("set currentDocument: ", value)
    this._currentDocument = value;
    this.commentText = ""
    this.currentComponent = undefined
    this.validationText.splice(0, this.validationText.length)

    if (value != undefined) {
      if (value.status === "INCORRECT") {
        this.changeStatus("DRAFT", "")
      }

      this.steps = value.docStep.filter(i => i.visible)
      //this.currentStepIndex = 0
    } else {
      if (this.itemsField)
        this.itemsField.clear()
      this.steps = []
      this.currentStepIndex = 0
    }
    //this.changeDetection.detectChanges()
    this.resizeWindow()
  }


  @Input() set editDocId(value: number) {
    this._editDocId = value
  }

  @Input() set openType(value: OpenDocType) {
    this._openType = value
  }

  get openType(): OpenDocType {
    return this._openType;
  }

  @ViewChild("watch_mainContainer", {static: false})
  private mainContainer: ElementRef;

  @ViewChild('watch_field', {read: ViewContainerRef})
  private itemsField: ViewContainerRef | undefined

  private componentRef: ComponentRef<IceComponent>
  private firstComponentRef: ComponentRef<IceComponent> = undefined
  dialogCorrectX: number = 0
  dialogCorrectY: number = 0
  cellRowList: any
  cellInnerList: any
  cellColl: number
  cellType: CellType = CellType.client
  private _currentStepIndex = 1
  commentText: string = ""
  validationText: Array<string> = []
  componentSelected$: Subscription
  changeValue$: Subscription
  currentComponent: IceComponent
  tabChange$: Subscription
  isDocumentRequiredFieldNotEmpty: boolean = false
  private _isStepRequiredFieldNotEmpty: boolean = false

  checkedText: string | undefined
  disabledStep: boolean = false
  isReasonAsk: boolean = false
  $reason: Observable<string> = new Observable<string>()
  requiredText: string;

  constructor(private componentService: ComponentService,
              private backService: BackendService,
              private messageService: MessageService,
              private tabService: TabService,
              private changeDetection: ChangeDetectorRef,
              public dialog: MatDialog,
              private stepService: StepService,
              private eventService: EventService,
              private workerService: WorkerService,
              private dataSourceService: DataSourceService,
              private timeService: TimeService
  ) {
    DocumentEditorComponent.instance = this
  }

  ngOnDestroy(): void {
    if (this.getMaketFull$)
      this.getMaketFull$.unsubscribe()
    if (this.componentSelected$)
      this.componentSelected$.unsubscribe()
    if (this.changeValue$)
      this.changeValue$.unsubscribe()
    if (this.createDocument$)
      this.createDocument$.unsubscribe()
    if (this.updateDocument$)
      this.updateDocument$.unsubscribe()
    if (this.tabChange$)
      this.tabChange$.unsubscribe()
    if (this.reportInterval$)
      this.reportInterval$.unsubscribe()
  }

  get currentDocument(): IceDocument | undefined {
    return this._currentDocument;
  }

  ngAfterViewChecked() {
    this.setMainBounds()
  }

  @HostListener('window:resize', ['$event'])
  resizeWindow() {
    this.setMainBounds()
    this.currentStepIndex = this.currentStepIndex
  }

  setMainBounds() {
    if (!this.mainContainer) return
    this.dialogCorrectX = this.mainContainer.nativeElement.getBoundingClientRect().x - 20
    this.dialogCorrectY = this.mainContainer.nativeElement.getBoundingClientRect().y
  }

  get currentStepIndex(): number {
    return this._currentStepIndex;
  }

  set currentStepIndex(value: number) {
    if (!this.currentDocument || value === undefined) return

    this.commentText = ""
    this.checkedText = ""
    this.validatonTextClear()

    // if (this._currentStepIndex != value && this.openType === "EDIT" /*&& value != 0*/) {
    //   this.saveDoc(this.currentDocument.status, 0)
    // }


    if (this.itemsField)
      this.itemsField.clear()
    this.showComponentOnCurrentStep(value + 1)

    this.checkStepComponent();
    this.checkRequiredOnCurrentStep()

    // /**Создаем событие открытие страницы*/
    // if(!this.eventService.isWorkerResize && value != this._currentStepIndex) {
    //   console.log("value",value)
    //   console.log("_currentStepIndex",this._currentStepIndex)
    //   console.log("this.steps",this.steps)
    //   this.eventService.launchEvent(EventObject.ON_STEP_OPEN, this.currentDocument, this.steps[value].stepEvent)
    // }
    // else
    //    this.eventService.isWorkerResize = false

    this._currentStepIndex = value;

  }

  private checkStepComponent() {
    if (this.openType != "EDIT" || !this.steps[this.currentStepIndex]) return
    if (this.currentDocument) {
      this.steps[this.currentStepIndex].componentMaket.filter(c => c.componentType != IceComponentType.TEXT).forEach(comp => {
        comp.checkedText = this.checkValidValue(comp)
        this.componentService.setComponentValue({
          componentId: comp.componentID,
          value: "NaN",
          checkedText: comp.checkedText
        })
        if (comp.checkedText.length > 0) {
          this.isStepRequiredFieldNotEmpty = false
        }
      })

      this.changeDetection.detectChanges()
    }
  }

  checkAllStepsToRule() {
    if (this.currentDocument) {
      //let compList = this.currentDocument.docStep.filter(item => item.visible).map(i => i.componentMaket).flat(2)
      this.isDocumentRequiredFieldNotEmpty = true

      this.currentDocument.docStep.filter(item => item.visible).forEach(step => {
        for (let i in step.componentMaket) {
          if (this.checkValidValue(step.componentMaket[i]).length > 0) {
            this.isDocumentRequiredFieldNotEmpty = false
            this.requiredText = "См. страницу '" + step.stepName + "'"
            break
          }
        }
      })
      // for (let i in compList) {
      //   if (this.checkValidValue(compList[i]).length > 0) {
      //     this.isDocumentRequiredFieldNotEmpty = false
      //     break
      //   }
      // }
    }
  }

  setValidationText(component: IceComponent) {
    this.validatonTextClear()
    if (component.minLength)
      this.validationText.push("Минимальная длина текста: " + component.minLength)
    if (component.maxLength)
      this.validationText.push("Максимальная длина текста: " + component.maxLength)
    if (component.minVal)
      this.validationText.push("Минимальное значение: " + component.minVal)
    if (component.maxVal)
      this.validationText.push("Максимальное значение: " + component.maxVal)
    // if (component.regExp)
    //   this.validationText.push("Значение данного поля должно соответствовать маске: " + component.regExp)
  }

  validatonTextClear() {
    this.validationText.splice(0, this.validationText.length)
  }

  ngOnInit(): void {
    this.componentSelected$ = this.componentService.selectedDocumentComponent$.subscribe(component => {

      /**Создаем событие клик компонента*/
      if (!this.eventService.isWorkerResize)
        this.eventService.launchEvent(EventObject.ON_COMPONENT_CLICK, this.currentDocument, component.componentEvent, null)
      else
        this.eventService.isWorkerResize = false


      this.currentComponent = component
      this.commentText = component.notification
      this.setValidationText(component)

      /**Работа с группами чекбоксов*/
      if(this.currentComponent.componentType === IceComponentType.INPUT && this.currentComponent.inputType === "checkbox" && this.currentComponent.radioGroupID
        && this.currentComponent.value === false){
        /**Это групповой чекбокс нужно остальные погасить*/
        let checkList = this.currentDocument.docAttrib.checkGroupList.find(crg => crg.id === Number(this.currentComponent.radioGroupID)).checkList
        if(checkList){
          checkList
            .filter(value => value.id != this.currentComponent.componentID)
            .forEach(checkButton => {
              this.steps[this.currentStepIndex].componentMaket.find(c => c.componentID === checkButton.id).value = false
            })
          this.steps[this.currentStepIndex].componentMaket.find(c => c.componentID === this.currentComponent.componentID).value = true
          this.resizeWindow()
        }
      }
    })

    this.changeValue$ = this.componentService.changeValue$.pipe(
      filter(item => !!item.componentId),
      filter(item => item.value != "NaN"),
      debounceTime(this.currentDebounce)
    ).subscribe(item => {
       if(this.currentDebounce != this.defaultDebounce)
         this.currentDebounce = this.defaultDebounce

      let currentComponent = this.steps[this.currentStepIndex].componentMaket.find(c => c.componentID === item.componentId)
      if (!currentComponent) return


      if (currentComponent.value != item.value) {
        currentComponent.value = item.value
        this.currentDocument.changed = true
      }

      if (currentComponent.componentType === "upload") {//Если идет изменение загруженных файлов нужно сразу сохранять
        this.saveDoc(this.currentDocument.status, 0)
      }

      if (this.openType === "EDIT") {
        currentComponent.checkedText = this.checkValidValue(currentComponent)
        this.checkAllStepsToRule()
        this.checkRequiredOnCurrentStep()
      }
      this.componentService.setComponentValue({
        componentId: item.componentId,
        value: "NaN",
        checkedText: currentComponent.checkedText
      })
      this.changeDetection.detectChanges()

      /**Создаем событие значение компонента*/
      if (!this.eventService.isWorkerResize)
        this.eventService.launchEvent(EventObject.ON_COMPONENT_CHANGE_VALUE, this.currentDocument, currentComponent.componentEvent, item.value)
      else
        this.eventService.isWorkerResize = false
    })

    this.cellColl = cellColl
    this.cellRowList = new Array(collInRow * cellRow).fill(null).map((_, i) => i + 1);
    this.cellInnerList = new Array(cellColl).fill(null).map((_, i) => i + 1);

    this.stepService.disabledAllStep$.subscribe({
      next: value => {
        this.disabledStep = value
        this.changeDetection.detectChanges()
      }
    })

    /**Слушаем печать*/
    this.savedIsDone$.subscribe({
      next: value => {
        if(value === true && this.isSavedForPrint === true){
          this.isSavedForPrint = false
          this.backService.createReport(1, "PDF", [this.currentDocument.id]).subscribe({
              next: value => {
                if (value.status === "ERROR") {
                  this.messageService.show(value.message, value.message, ERROR)
                }
                if (value.status === "DONE" && value.reportFile.length > 0) {
                  window.open("assets/report/" + value.reportFile, "_blank");
                }
                if (value.status === "PROCESS" && value.uuid.length > 0) {
                  this.reportProcessUID = value.uuid
                  this.messageService.show(MESSAGE_REPORT_IN_PROCESS, "", INFO).subscribe({
                    next: value1 => {
                      this.startReportTimer()
                    }
                  })
                }

              },
              error: err => {
                this.messageService.show(err, err, ERROR)
              }
            }
          )
        }
      }
    })
  }

  checkRequiredOnCurrentStep() {
    if (this.openType != "EDIT" || !this.steps[this.currentStepIndex]) return
    if (this.steps.length > 0)
      this.isStepRequiredFieldNotEmpty = this.steps[this.currentStepIndex].componentMaket.filter(i => i.checkedText && i.checkedText.length > 0).length < 1
  }

  showComponentOnCurrentStep(stepNum: number) {
    this.firstComponentRef = undefined;
    if (!this.steps[stepNum - 1]) return

    let stepComponentList = this.steps[stepNum - 1].componentMaket
    stepComponentList.forEach(comp => {
      if (comp.componentType === IceComponentType.SELECT) {
        this.componentRef = this.itemsField.createComponent(SelectComponent);
        comp.optionList = comp.optionList ? comp.optionList : []
      }
      if (comp.componentType === IceComponentType.PLACE)
        this.componentRef = this.itemsField.createComponent(AddressComponent);
      if (comp.componentType === IceComponentType.TEXT)
        this.componentRef = this.itemsField.createComponent(TextComponent);
      if (comp.componentType === IceComponentType.UPLOAD) {
        this.componentRef = this.itemsField.createComponent(UploadComponent);
        (this.componentRef.instance as UploadComponent).currentDocument = this.currentDocument
      }
      if (comp.componentType === IceComponentType.INPUT)
        this.componentRef = this.itemsField.createComponent(InputComponent);
      if (comp.componentType === IceComponentType.AREA)
        this.componentRef = this.itemsField.createComponent(AreaComponent);
      if (comp.componentType === IceComponentType.TABLE) {
        switch (comp.tableType) {
          case 1:
            this.componentRef = this.itemsField.createComponent(InformationMainCounterpartiesTableComponent);
            break;
          case 2:
            this.componentRef = this.itemsField.createComponent(InformationCompanyParticipantsTableComponent);
            break;
          default:
            this.componentRef = this.itemsField.createComponent(TableComponent);
        }
      }

      let compInstance = this.componentRef.instance

      compInstance.enabled = comp.enabled === undefined ? true : comp.enabled
      compInstance.visible = comp.visible === undefined ? true : comp.visible
      compInstance.componentType = comp.componentType
      compInstance.inputType = comp.inputType
      compInstance.componentID = comp.componentID
      compInstance.optionList = comp.optionList
      compInstance.componentBound = comp.bound
      compInstance.cellNumber = comp.cellNumber
      compInstance.componentName = comp.componentName
      compInstance.placeHolder = comp.placeHolder
      compInstance.correctX = this.dialogCorrectX
      compInstance.correctY = this.dialogCorrectY
      compInstance.stepNum = stepNum
      compInstance.required = comp.required
      compInstance.textPosition = comp.textPosition
      compInstance.frameColor = comp.frameColor
      compInstance.maxLength = comp.maxLength
      compInstance.maxVal = comp.maxVal
      compInstance.minLength = comp.minLength
      compInstance.minVal = comp.minVal
      compInstance.regExp = comp.regExp
      compInstance.notification = comp.notification
      compInstance.value = comp.value
      compInstance.masterControlList = comp.masterControlList
      compInstance.checkedText = comp.checkedText
      compInstance.tableProp = comp.tableProp
      compInstance.componentEvent = comp.componentEvent
      compInstance.customAttribName = comp.customAttribName
      compInstance.customAttribColumnName = comp.customAttribColumnName
      compInstance.radioGroupID = comp.radioGroupID

      if (this.openType !== "EDIT")
        compInstance.enabled = false

      if (comp.componentType === IceComponentType.INPUT || comp.componentType === IceComponentType.AREA)
        this.setFirstComponent();

      /**Создаем событие установка значения компонента*/
      if (!this.eventService.isWorkerResize && comp.value) {
        this.eventService.launchEvent(EventObject.ON_COMPONENT_SET_VALUE, this.currentDocument, comp.componentEvent, comp.value)
      } else
        this.eventService.isWorkerResize = false
    })
    this.setFocusToFirstElement()
    this.changeDetection.detectChanges()
  }

  private setFocusToFirstElement() {
    setTimeout(() => {
      if (this.firstComponentRef) {
        let componentID = this.firstComponentRef.instance.componentID.toString()
        let elem = document.getElementById(componentID)
        if (elem)
          elem.focus()
        this.componentService.selectedDocumentComponent$.next(this.firstComponentRef.instance)
      }
    }, 500)
  }

  private setFirstComponent() {
    if (!this.firstComponentRef && this.componentRef.instance.inputType != "checkbox")
      this.firstComponentRef = this.componentRef
  }

  loadDocMaket(maketId: number) {
    this.getMaketFull$ = this.backService.getMaketFull(maketId).subscribe({
      next: ((res) => {
        /**Формируем новый документ*/
        this.currentDocument = {
          maketId: res.id,
          docName: res.docName,
          docStep: res.docStep,
          status: "DRAFT",
          docAttrib: res.docAttrib,
        }
        this.openType = "EDIT"

        /**Создаем источники данных*/
        this.dataSourceService.createDataSourceList(this.currentDocument)

        /**Создаем воркеры*/
        if (this.currentDocument.docAttrib && this.currentDocument.docAttrib.workerList)
          this.workerService.createWorker(this.currentDocument)


        /**Создаем событие создание документа*/
        if (!this.eventService.isWorkerResize)
          this.eventService.launchEvent(EventObject.ON_DOCUMENT_CREATE, this.currentDocument, this.currentDocument.docAttrib.documentEventList)
        else
          this.eventService.isWorkerResize = false

        /**И сохраняем его сразу как черновик*/
        // if(this.currentDocument.id === undefined) {
        //   this.saveDoc(this.currentDocument.status, 0)
        // }

        this._isOpenedTab = true
      }),
      error: (err => this.messageService.show(MAKET_LOAD_ERROR, err.error.message, ERROR))
    })
  }

  saveDoc(docStatus: DocStat | undefined, reg: number) {
    if (!this.currentDocument || docStatus === "INCORRECT") return
    if (docStatus != undefined)
      this.currentDocument.status = docStatus

    /**нужно залить доп атрибуты*/
    this.setCurrentAttrib()

    if (this.currentDocument.id === undefined) {
      this.createDocument$ = this.backService.createDocument(this.currentDocument).subscribe({
        next: (res => {
          if (res && this.currentDocument) {
            this.currentDocument.id = res.id
            this.savedIsDone$.next(true)
          }
        }),
        error: (err => this.messageService.show(DRAFT_SAVE_ERROR, err.error.message, ERROR))
      })
    } else {
      if (reg === 0) {
        this.updateDocument$ = this.backService.updateDocument(this.currentDocument).subscribe({
          //this.updateDocument$ = this.backService.updateOnlyDate(this.currentDocument).subscribe({
          next: (res => {
            this.savedIsDone$.next(true)
          }),
          error: (err => {
            this.messageService.show(DOCUMENT_SAVE_ERROR, err.error.message, ERROR)
          })
        })
      } else {
        this.updateDocument$ = this.backService.updateDocument(this.currentDocument).subscribe({
          next: (res => {
            this.docSaved(docStatus === "DRAFT" ? DOCUMENT_DRAFT_SAVED : DOCUMENT_SEND, "")
            this.savedIsDone$.next(true)
          }),
          error: (err => {
            this.messageService.show(DOCUMENT_SAVE_ERROR, err.error.message, ERROR)
          })
        })
      }
    }
    this.changeDetection.detectChanges()
  }

  private setCurrentAttrib() {
    let rezObj: Object = {}
    this.currentDocument.docStep
      .map(item => item.componentMaket)
      .flat()
      .filter(item => item.customAttribName)
      .map(item => {
        Object.defineProperty(rezObj, item.customAttribName, {
          value: item.value,
          writable: true,
          enumerable: true,
          configurable: true
        })
        Object.defineProperty(rezObj, item.customAttribName + "_column_name", {
          value: item.customAttribColumnName,
          writable: true,
          enumerable: true,
          configurable: true
        })
      })
    this.currentDocument.customAttrib = rezObj
  }

  private docSaved(message: string, message2: string) {
    this.tabChange$ = this.messageService.show(message, message2, INFO).subscribe(res => {
      this.tabService.openTab(TAB_DOCUMENT_LIST)
      this.currentDocument = undefined
    })
  }

  private checkValidValue(currentComponent: ComponentMaket): string {

    let errorStr: string = ""

    if (this.currentDocument === undefined) return errorStr
    let value = currentComponent.value

    if (
      currentComponent.componentType != IceComponentType.AREA
      && currentComponent.componentType != IceComponentType.INPUT
      && currentComponent.componentType != IceComponentType.PLACE
      && currentComponent.componentType != IceComponentType.UPLOAD
      && currentComponent.componentType != IceComponentType.SELECT
    )
      return errorStr

    if (value === undefined)
      value = ""
    /**В начале проверяем заполнение обязательных полей*/
    if (currentComponent.componentType === IceComponentType.PLACE) {
      if (currentComponent.required && (!value || (value && value.placeString.length < 1)))
        errorStr = "Не заполнено обязательное поле."
    } else {
      if (currentComponent.required && (!value || (value && value.length < 1)))
        errorStr = "Не заполнено обязательное поле."
    }

    if (currentComponent.componentType === IceComponentType.AREA
      || (currentComponent.componentType === IceComponentType.INPUT && currentComponent.inputType === 'text')) {
      if (currentComponent.maxLength != undefined && value.length > currentComponent.maxLength)
        errorStr += `Нарушено ограничение по максимальному количеству символов.`
      if (currentComponent.minLength != undefined && value.length < currentComponent.minLength)
        errorStr += `Нарушено ограничение по минимальному количеству символов.`
    }

    if (currentComponent.componentType === IceComponentType.INPUT && currentComponent.inputType === 'number') {
      if (currentComponent.maxVal != undefined && value > currentComponent.maxVal)
        errorStr += `Нарушено ограничение по максимальному значению.`
      if (currentComponent.minVal != undefined && value < currentComponent.minVal)
        errorStr += `Нарушено ограничение по минимальному значению.`
    }
    return errorStr
  }

  setTableNode() {
    let idName = "mat-tab-label-1-" + (this.currentStepIndex)
    let comp = document.getElementById(idName)
    if (comp) {
      this.tabLabelNode = comp.children[2].children.item(0) as HTMLElement
    }

  }

  set isStepRequiredFieldNotEmpty(value: boolean) {
    this.setTableNode()
    if (this.tabLabelNode) {

      if (!value) {
        //this.tabLabelNode.style.cssText = 'color: red;'
        this.steps[this.currentStepIndex].checkedText = "ERROR"
      } else {
        this.steps[this.currentStepIndex].checkedText = "SUCCESS"
        //this.tabLabelNode.style.cssText = 'color: #0E9F6E;'
      }
    }
    this._isStepRequiredFieldNotEmpty = value;
  }

  changeStatusWithReason(status: string) {
    let componentRef = this.dialog.open(StatusReasonComponent, {
        width: '' + window.innerWidth / 2 + 'px',
        height: '' + window.innerWidth / 4 + 'px',
        enterAnimationDuration: dialogOpenAnimationDuration,
        exitAnimationDuration: dialogCloseAnimationDuration
      }
    );

    componentRef.afterClosed().subscribe({
      next: value => this.changeStatus(status, value)
    })
  }


  changeStatus(status: string, reason: string) {
    this.backService.changeStatus(this.currentDocument.id, status, reason).subscribe({
        next: value => {
          if (this.currentDocument.status === "INCORRECT" && status === "DRAFT") {
            this.currentDocument.status = "DRAFT"
          }
          if (this.currentDocument.status === "AGREE") {
            this.docSaved(value.message, status === "DRAFT" ? CHANGE_STATUS_TO_DRAFT : CHANGE_STATUS_TO_SENDING)
          }

        },
        error: err => this.messageService.show(CHANGE_STATUS_ERROR, err.error.message, ERROR)
      }
    )
  }

  clearStep() {
    this.currentDocument.docStep[this.currentStepIndex].componentMaket.forEach(c => {
      c.value = undefined
    })
    this.currentStepIndex = this.currentStepIndex
  }

  print() {
    this.isSavedForPrint = true
    this.saveDoc(this.currentDocument.status, 0)
  }

  isToolBarShow() {
    if (this.currentDocument && this.currentDocument.docStep.filter(item => item.visible === true)[this.currentStepIndex])
      return this.currentDocument.docStep.filter(item => item.visible === true)[this.currentStepIndex].isToolBar
    return false
  }


  startReportTimer() {
    console.log("startReportTimer")
    this.reportInterval$ = interval(5000).subscribe(() => {
      if (this.reportProcessUID) {
        this.timeService.isBlocked = true
        this.backService.getReportStatus(this.reportProcessUID).subscribe({
          next: value => {
            if (value.status === "ERROR") {
              this.reportProcessUID = undefined
              this.reportInterval$.unsubscribe()
              this.messageService.show(value.message, value.message, ERROR)
            }
            if (value.status === "DONE" && value.reportFile.length > 0) {
              this.reportProcessUID = undefined
              this.reportInterval$.unsubscribe()
              this.messageService.show(MESSAGE_REPORT_IS_DONE, "", INFO,["YES","NO"]).subscribe({
                next: button => {
                  if (button === "YES") {
                    window.open("assets/report/" + value.reportFile, "_blank");
                  }
                }
              })

            }
            if (value.status === "PROCESS" && value.uuid.length > 0) {
              console.log(value)
            }
          },
          error: err => {
            this.messageService.show(err, err, ERROR)
          },
          complete: () => {
            this.timeService.isBlocked = false
          }
        })
      }
    })

  }

}

