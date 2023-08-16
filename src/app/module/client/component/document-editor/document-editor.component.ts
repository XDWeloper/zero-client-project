import {
  AfterViewChecked,
  ChangeDetectionStrategy, ChangeDetectorRef,
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
import {ComponentMaket, IceComponent, IceDocument, IceStepMaket} from "../../../../interfaces/interfaces";
import {
  cellColl,
  cellRow,
  CellType,
  collInRow,
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
import {debounceTime, filter, Subscription} from "rxjs";
import {ComponentService} from "../../../../services/component.service";
import {BackendService} from "../../../../services/backend.service";
import {MessageService} from "../../../../services/message.service";
import {TabService} from "../../../../services/tab.service";
import {UploadComponent} from "../../../../component/dinamicComponent/upload/upload.component";
import {AddressComponent} from "../../../../component/dinamicComponent/adress/address.component";
import {SelectComponent} from "../../../../component/dinamicComponent/select/select.component";

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


  @Input() set currentDocument(value: IceDocument | undefined) {
    this._currentDocument = value;
    this.commentText = ""
    this.currentComponent = undefined
    this.validationText.splice(0, this.validationText.length)

    if (value != undefined) {
      this.steps = value.docStep
      this.currentStepIndex = 0
      //this.checkAllStepsToRule()
    } else
      this.steps = []
    this.changeDetection.detectChanges()
  }


  @Input() set editDocId(value: number) {
    this._editDocId = value
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


  constructor(private componentService: ComponentService,
              private backService: BackendService,
              private messageService: MessageService,
              private tabService: TabService,
              private changeDetection: ChangeDetectorRef) {
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
    if (this._currentStepIndex != value)
      this.saveDraft()

    this._currentStepIndex = value;

    if (this.itemsField)
      this.itemsField.clear()

    if (this.currentDocument)
      this.showComponentOnCurrentStep(this._currentStepIndex + 1)

    this.checkStepComponent();
  }

  private checkStepComponent() {
    if (this.currentDocument) {
      this.currentDocument.docStep[this._currentStepIndex].componentMaket.forEach(comp => {
        comp.checkedText = this.checkValidValue(comp)
        this.componentService.setComponentValue({
          componentId: comp.componentID,
          value: "NaN",
          checkedText: comp.checkedText
        })
        this.isStepRequiredFieldNotEmpty = comp.checkedText.length < 1
      })
    }
  }

  checkAllStepsToRule() {

    if (this.currentDocument) {
      let compList = this.currentDocument.docStep.map(i => i.componentMaket).flat(2)
      this.isDocumentRequiredFieldNotEmpty = true
      for (let i in compList){
        if(this.checkValidValue(compList[i]).length > 0){
          this.isDocumentRequiredFieldNotEmpty = false
          break
        }
      }
    }
  }



  setValidationText(component: IceComponent) {
    this.validationText.splice(0, this.validationText.length)
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

      let currentComponent = this.currentDocument.docStep[this.currentStepIndex].componentMaket.find(c => c.componentID === item.componentId)
      currentComponent.value = item.value
      if(currentComponent.componentType === "upload"){//Если идет изменение загруженных файлов нужно сразу сохранять
        this.saveDraft()
      }

      currentComponent.checkedText = this.checkValidValue(currentComponent)
      this.checkAllStepsToRule()
      this.isStepRequiredFieldNotEmpty = this.currentDocument.docStep[this.currentStepIndex].componentMaket.filter(i => i.checkedText && i.checkedText.length > 0).length < 1
      this.componentService.setComponentValue({
        componentId: item.componentId,
        value: "NaN",
        checkedText: currentComponent.checkedText
      })
    })

    this.cellColl = cellColl
    this.cellRowList = new Array(collInRow * cellRow).fill(null).map((_, i) => i + 1);
    this.cellInnerList = new Array(cellColl).fill(null).map((_, i) => i + 1);
    this.currentStepIndex = this.currentStepIndex
  }

  showComponentOnCurrentStep(stepNum: number) {
    this.firstComponentRef = undefined;
    let stepComponentList = this.currentDocument.docStep.find(p => p.stepNum === stepNum).componentMaket

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

      if (comp.componentType === IceComponentType.INPUT || comp.componentType === IceComponentType.AREA)
        this.setFirstComponent();
    })
    this.setFocusToFirstElement()
  }

  private setFocusToFirstElement() {
    setTimeout(() => {
      if (this.firstComponentRef) {
        let componentID = this.firstComponentRef.instance.componentID.toString()
        let elem = document.getElementById(componentID)
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
          status: "new"
        }
        // /**И сохраняем его сразу как черновик*/
        // this.saveDraft()
      }),
      error: (err => this.messageService.show(MAKET_LOAD_ERROR, err.error.message, ERROR))
    })
  }

  saveDoc(docStatus: DocStat, reg: number) {
    if (!this.currentDocument) return
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
            this.docSaved(docStatus === "DRAFT" ? DOCUMENT_DRAFT_SAVED : DOCUMENT_SEND)
        }),
        error: (err => {
          this.messageService.show(DOCUMENT_SAVE_ERROR, err.error.message, ERROR)
        })
      })
    }
  }

  private docSaved(message: string) {
    this.tabChange$ = this.messageService.show(message, "Тут можно еще добавить какое-то пояснение.", INFO).subscribe(res => {
      this.tabService.openTab(TAB_DOCUMENT_LIST)
      this.currentDocument = undefined
    })
  }

  saveDraft() {
    this.saveDoc("DRAFT", 0)
  }

  private checkValidValue(currentComponent: ComponentMaket): string {
    let errorStr: string = ""

    if (this.currentDocument === undefined) return errorStr
    let value = currentComponent.value

    if (currentComponent.componentType != IceComponentType.AREA
      && currentComponent.componentType != IceComponentType.INPUT
      && currentComponent.componentType != IceComponentType.PLACE)
      return errorStr

    if (value === undefined)
      value = ""
    /**В начале проверяем заполнение обязательных полей*/
    if(currentComponent.componentType === IceComponentType.PLACE){
      if (currentComponent.required && (!value || (value && value.placeString.length < 1)))
        errorStr = "Не заполнено обязательное поле."
    }else{
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


  get isStepRequiredFieldNotEmpty(): boolean {
    return this._isStepRequiredFieldNotEmpty;
  }

  set isStepRequiredFieldNotEmpty(value: boolean) {
    this.setTableNode()
    if (this.tabLabelNode) {
      if (!value) {
        this.tabLabelNode.style.cssText = 'color: red;'
      } else {
        this.tabLabelNode.style.cssText = 'color: #0E9F6E;'
      }
    }

    this._isStepRequiredFieldNotEmpty = value;
  }
}
