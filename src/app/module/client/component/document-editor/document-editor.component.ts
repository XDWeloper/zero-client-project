import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  ElementRef,
  HostListener, Inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {ComponentMaket, IceComponent, IceDocument, IceStepMaket, OpenDocType} from "../../../../interfaces/interfaces";
import {
  cellColl,
  cellRow,
  CellType, CHANGE_STATUS_ERROR, CHANGE_STATUS_TO_DRAFT, CHANGE_STATUS_TO_SENDING,
  collInRow, dialogCloseAnimationDuration, dialogOpenAnimationDuration,
  DocStat,
  DOCUMENT_DRAFT_SAVED,
  DOCUMENT_SAVE_ERROR,
  DOCUMENT_SEND,
  DRAFT_SAVE_ERROR,
  ERROR,
  IceComponentType,
  INFO,
  MAKET_LOAD_ERROR,
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
import {debounceTime, filter, Observable, Subscription} from "rxjs";
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
import {PDFDocObject, PDFImageObject, PrintService} from "../../../../services/print.service";
import {AnketaScriptRule} from "../../../../data/anketaScriptRule";

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

  @Input() set isOpenedTab(value: boolean) {
    this._isOpenedTab = value
  }

  get isOpenedTab(): boolean {
    return this._isOpenedTab
  }

  @Input() set currentDocument(value: IceDocument | undefined) {
    this._currentDocument = value;
    this.commentText = ""
    this.currentComponent = undefined
    this.validationText.splice(0, this.validationText.length)

    if (value != undefined) {
      if (value.status === "INCORRECT") {
        this.changeStatus("DRAFT", "")
      }

      this.steps = value.docStep.filter(i => i.visible)
      this.currentStepIndex = 0
    } else {
      if (this.itemsField)
        this.itemsField.clear()
      this.steps = []
    }
    //this.changeDetection.detectChanges()
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

  constructor(private componentService: ComponentService,
              private backService: BackendService,
              private messageService: MessageService,
              private tabService: TabService,
              private changeDetection: ChangeDetectorRef,
              public dialog: MatDialog,
              private stepService: StepService,
              private printService: PrintService) {
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
    this.dialogCorrectX = this.mainContainer.nativeElement.getBoundingClientRect().x - 20
    this.dialogCorrectY = this.mainContainer.nativeElement.getBoundingClientRect().y
  }


  get currentStepIndex(): number {
    return this._currentStepIndex;
  }

  set currentStepIndex(value: number) {
    if (!this.currentDocument) return

    this.commentText = ""
    this.checkedText = ""
    this.validatonTextClear()


    if (this._currentStepIndex != value && this.openType === "EDIT") {
      this.saveDoc(this.currentDocument.status, 0)
    }

    this._currentStepIndex = value;

    if (this.itemsField)
      this.itemsField.clear()

    this.showComponentOnCurrentStep(this._currentStepIndex + 1)

    this.checkStepComponent();
    this.checkRequiredOnCurrentStep()
  }

  private checkStepComponent() {
    if (this.openType != "EDIT") return
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
      let compList = this.currentDocument.docStep.filter(i => i.visible).map(i => i.componentMaket).flat(2)
      this.isDocumentRequiredFieldNotEmpty = true
      for (let i in compList) {
        if (this.checkValidValue(compList[i]).length > 0) {
          this.isDocumentRequiredFieldNotEmpty = false
          break
        }
      }
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
      this.currentComponent = component
      this.commentText = component.notification
      this.setValidationText(component)
    })
    this.changeValue$ = this.componentService.changeValue$.pipe(
      filter(item => !!item.componentId),
      filter(item => item.value != "NaN"),
      debounceTime(500),
    ).subscribe(item => {
      let currentComponent = this.steps[this.currentStepIndex].componentMaket.find(c => c.componentID === item.componentId)
      //let currentComponent = this.currentDocument.docStep[this.currentStepIndex].componentMaket.find(c => c.componentID === item.componentId)
      currentComponent.value = item.value
      if (currentComponent.componentType === "upload") {//Если идет изменение загруженных файлов нужно сразу сохранять
        this.saveDoc(this.currentDocument.status, 0)
      }

      if (this.openType === "EDIT") {
        currentComponent.checkedText = this.checkValidValue(currentComponent)
        this.checkAllStepsToRule()
        this.checkRequiredOnCurrentStep()
      }
      //this.isStepRequiredFieldNotEmpty = this.steps[this.currentStepIndex].componentMaket.filter(i => i.checkedText && i.checkedText.length > 0).length < 1
      //this.isStepRequiredFieldNotEmpty = this.currentDocument.docStep[this.currentStepIndex].componentMaket.filter(i => i.checkedText && i.checkedText.length > 0).length < 1
      this.componentService.setComponentValue({
        componentId: item.componentId,
        value: "NaN",
        checkedText: currentComponent.checkedText
      })
      this.changeDetection.detectChanges()
    })

    this.cellColl = cellColl
    this.cellRowList = new Array(collInRow * cellRow).fill(null).map((_, i) => i + 1);
    this.cellInnerList = new Array(cellColl).fill(null).map((_, i) => i + 1);
    this.currentStepIndex = this.currentStepIndex

    this.stepService.disabledAllStep$.subscribe({
      next: value => {
        this.disabledStep = value
        this.changeDetection.detectChanges()
      }
    })
  }

  checkRequiredOnCurrentStep() {
    if (this.openType != "EDIT") return
    if (this.steps.length > 0)
      this.isStepRequiredFieldNotEmpty = this.steps[this.currentStepIndex].componentMaket.filter(i => i.checkedText && i.checkedText.length > 0).length < 1
  }

  showComponentOnCurrentStep(stepNum: number) {
    this.firstComponentRef = undefined;
    let stepComponentList = this.steps[stepNum - 1].componentMaket
    //let stepComponentList = this.currentDocument.docStep.find(p => p.stepNum === stepNum).componentMaket
    stepComponentList.forEach(comp => {
      if (comp.componentType === IceComponentType.SELECT)
        this.componentRef = this.itemsField.createComponent(SelectComponent);
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
        }
      }

      let compInstance = this.componentRef.instance

      compInstance.componentType = comp.componentType
      compInstance.inputType = comp.inputType
      compInstance.componentID = comp.componentID
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
      compInstance.optionList = comp.optionList

      if (this.openType === "EDIT")
        compInstance.enabled = true
      else
        compInstance.enabled = false

      if (comp.componentType === IceComponentType.INPUT || comp.componentType === IceComponentType.AREA)
        this.setFirstComponent();
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
          status: "DRAFT"
        }
        this.openType = "EDIT"
        // /**И сохраняем его сразу как черновик*/
        this.saveDoc(this.currentDocument.status, 0)
      }),
      error: (err => this.messageService.show(MAKET_LOAD_ERROR, err.error.message, ERROR))
    })
  }

  saveDoc(docStatus: DocStat, reg: number) {
    if (!this.currentDocument || docStatus === "INCORRECT") return
    this.currentDocument.status = docStatus

    if (this.currentDocument.id === undefined) {
      this.createDocument$ = this.backService.createDocument(this.currentDocument).subscribe({
        next: (res => {
          if (res) {
            this.currentDocument.id = res.id
          }
        }),
        error: (err => this.messageService.show(DRAFT_SAVE_ERROR, err.error.message, ERROR))
      })
    } else {
      this.updateDocument$ = this.backService.updateDocument(this.currentDocument).subscribe({
        next: (res => {
          if (reg === 1)
            this.docSaved(docStatus === "DRAFT" ? DOCUMENT_DRAFT_SAVED : DOCUMENT_SEND, "")
        }),
        error: (err => {
          this.messageService.show(DOCUMENT_SAVE_ERROR, err.error.message, ERROR)
        })
      })
    }
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
        this.tabLabelNode.style.cssText = 'color: red;'
        this.steps[this.currentStepIndex].checkedText = "ERROR"
      } else {
        this.steps[this.currentStepIndex].checkedText = "SUCCESS"
        this.tabLabelNode.style.cssText = 'color: #0E9F6E;'
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
    let docData = this.getDataForPdf()
    if (docData && docData.length > 0) {
      this.printService.createPDF(docData)
    }
  }

  private getDataForPdf(): PDFDocObject[] {

    let resultList: PDFDocObject[]
    let asr = new AnketaScriptRule(this.currentDocument)
    resultList = asr.getPrintRules()

    return resultList
  }
}

