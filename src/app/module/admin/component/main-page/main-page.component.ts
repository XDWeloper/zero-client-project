import {
  Component,
  ComponentRef,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {CellService} from "../../../../services/cell.service";
import {ComponentService} from "../../../../services/component.service";
import {
  cellColl,
  cellRow,
  CellType,
  collInRow, dialogCloseAnimationDuration, dialogOpenAnimationDuration,
  docPanelCloseWidth,
  docPanelOpenWidth,
  IceComponentType,
  propPanelCloseWidth,
  propPanelOpenWidth,
  tableList
} from "../../../../constants";
import {Subscription} from "rxjs";
import {IceMaketComponent} from "../../classes/icecomponentmaket";
import {MaketComponent} from "../maketComponent/maket.component";
import {MatDialog} from "@angular/material/dialog";
import {EditTextComponent} from "../edit-text/edit-text.component";
import {ComponentMaket, DocumentTreeTempl, StepTreeTempl} from "../../../../interfaces/interfaces";
import {DocumentService} from "../../../../services/document.service";
import {WatchTemplateComponent} from "../watch-template/watch-template.component";
import {ChangeTableComponent} from "../change-table/change-table.component";
import {User} from "../../../../model/User";
import {BackendService} from "../../../../services/backend.service";
import {Router} from "@angular/router";
import {TimeService} from "../../../../services/time.service";
import {KeycloakService} from "../../../../services/keycloak.service";

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
})
export class MainPageComponent implements OnInit, OnDestroy {

  docPanelCloseWidth = docPanelCloseWidth
  docPanelOpenWidth = docPanelOpenWidth
  propPanelCloseWidth = propPanelCloseWidth
  propPanelOpenWidth = propPanelOpenWidth
  private currentComponentID: number | undefined
  docPanelCurrentSize: number = docPanelOpenWidth//тут меняем если нужно открыть/закрыть
  propPanelCurrentSize: number = propPanelOpenWidth//тут меняем если нужно открыть/закрыть
  cellRowList: any;
  cellInnerList: any;
  cellColl: number
  currentDocAndStep: any
  currentDoc: DocumentTreeTempl
  currentStep: StepTreeTempl

  @ViewChild('field', {read: ViewContainerRef})
  private itemsField: ViewContainerRef | undefined

  private componentRef: ComponentRef<IceMaketComponent>

  @ViewChild('splitMainContainer', {read: ElementRef})
  private mainContainer: ElementRef
  /**Для контекстных менюшек*/
  isMenuHidden: boolean = true
  xPosTabMenu = 0
  yPosTabMenu = 0
  currCompType: IceComponentType
  private rightClick$: Subscription
  cellType: CellType = CellType.admin
  user: User
  private _modify: boolean = false

  constructor(private cellService: CellService,
              private router: Router,
              private componentService: ComponentService,
              public dialog: MatDialog,
              private documentService: DocumentService,
              private backService: BackendService,
              private timeService: TimeService,
              private keycloakService: KeycloakService) {

    /**Разрешить обновление токенов*/
    timeService.isRefreshToken = true

    backService.requestUserProfile().subscribe({
      next: value => {
        if(value && (value.roles as Array<string>).includes("ROLE_admin")) return
        this.router.navigate(["/"])
          },
      error: (() => this.router.navigate(["/"]))
    })
    let userString = localStorage.getItem("user")
    if(userString)
      this.user = JSON.parse(userString)
  }


  get modify(): boolean {
    return this._modify;
  }

  set modify(value: boolean) {
    this.componentService.setModified(value)
    this._modify = value;
  }

  ngOnDestroy(): void {
    this.rightClick$.unsubscribe()
    this.cellRowList.drop
  }

  openDocPanel() {
    if (this.docPanelCurrentSize > this.docPanelCloseWidth)
      this.docPanelCurrentSize = this.docPanelCloseWidth
    else
      this.docPanelCurrentSize = this.docPanelOpenWidth
  }

  openPropPanel() {
    if (this.propPanelCurrentSize > this.propPanelCloseWidth)
      this.propPanelCurrentSize = this.propPanelCloseWidth
    else
      this.propPanelCurrentSize = this.propPanelOpenWidth
  }

  docPanelResize($event: any) {
    if ($event.gutterNum === 1) {
      if ($event.sizes[0] === '*')
        this.docPanelCurrentSize = this.docPanelCloseWidth
      else
        this.docPanelCurrentSize = $event.sizes[0]
    } else {
      if ($event.sizes[0] === '*')
        this.propPanelCurrentSize = this.propPanelCloseWidth
      else
        this.propPanelCurrentSize = $event.sizes[2]

    }
  }

  createComponent(componentType: string, compMaket?: ComponentMaket)  {
    this.componentRef = this.itemsField?.createComponent(MaketComponent);

    switch (componentType) {
      case "text":
        this.componentRef.instance.componentType = IceComponentType.TEXT;
        this.componentRef.instance.value = "Текстовое поле"
        break;
      case "input":
        this.componentRef.instance.componentType = IceComponentType.INPUT;
        this.componentRef.instance.placeHolder = "Поле ввода"
        this.componentRef.instance.inputType = 'text'
        break;
      case "table":
        if(compMaket === undefined) {
          this.componentRef.instance.componentType = IceComponentType.TABLE;
          this.componentRef.instance.placeHolder = "Таблица тип не определен"
          this.openTablesDialog(dialogOpenAnimationDuration, dialogCloseAnimationDuration)
        }
        break;
      case "area":
        this.componentRef.instance.componentType = IceComponentType.AREA;
        this.componentRef.instance.placeHolder = "Область ввода"
        break;
      case "select":
        this.componentRef.instance.componentType = IceComponentType.SELECT;
        this.componentRef.instance.placeHolder = "Поле выбора"
        break;
      case "place":
        this.componentRef.instance.componentType = IceComponentType.PLACE;
        this.componentRef.instance.placeHolder = "Адресное пространство"
        break;
      case "upload":
        this.componentRef.instance.componentType = IceComponentType.UPLOAD;
         this.componentRef.instance.placeHolder = ""
        break;
      case "button":
        this.componentRef.instance.componentType = IceComponentType.BUTTON;
         this.componentRef.instance.placeHolder = "Кнопка"
        break;
    }

    this.componentRef.instance.textPosition ={horizontal: 'left', vertical: 'top'}
    this.componentRef.instance.required= false


    if(compMaket != undefined){//Устанавливаем все параметры
      this.componentRef.instance.cellNumber = compMaket.cellNumber
      this.componentRef.instance.componentType = compMaket.componentType
      this.componentRef.instance.inputType = compMaket.inputType
      this.componentRef.instance.componentName = compMaket.componentName
      this.componentRef.instance.componentID = compMaket.componentID
      this.componentRef.instance.bound = compMaket.bound
      this.componentRef.instance.value = compMaket.value
      this.componentRef.instance.placeHolder = compMaket.placeHolder
      this.componentRef.instance.textColor = compMaket.textColor
      this.componentRef.instance.backgroundColor = compMaket.backgroundColor
      this.componentRef.instance.required = compMaket.required
      this.componentRef.instance.textPosition = compMaket.textPosition
      this.componentRef.instance.tableType = compMaket.tableType
      this.componentRef.instance.frameColor = compMaket.frameColor
      this.componentRef.instance.notification = compMaket.notification
      this.componentRef.instance.minLength = compMaket.minLength
      this.componentRef.instance.maxLength = compMaket.maxLength
      this.componentRef.instance.regExp = compMaket.regExp
      this.componentRef.instance.minVal = compMaket.minVal
      this.componentRef.instance.maxVal = compMaket.maxVal
      this.componentRef.instance.masterControlList = compMaket.masterControlList
      this.componentRef.instance.optionList = compMaket.optionList

    } else{
      this._modify = true
    }
      this.componentService.addComponent(this.componentRef)
  }

  ngOnInit(): void {
    this.cellColl = cellColl
    this.cellRowList = new Array(collInRow * cellRow).fill(null).map((_, i) => i + 1);
    this.cellInnerList = new Array(cellColl).fill(null).map((_, i) => i + 1);
    new ResizeObserver(() => {
      let bound = this.mainContainer.nativeElement.getBoundingClientRect()
      this.cellService.tableResize$.next(bound)
      this.cellService.tableResizer$.next(bound)
    }).observe(document.getElementById('mainContainer'))

    this.rightClick$ = this.componentService.rightClick$.subscribe(val => {
      this.isMenuHidden = false
      this.xPosTabMenu = (val.event as MouseEvent).x
      this.yPosTabMenu = (val.event as MouseEvent).y
      this.currentComponentID = val.compID
      this.currCompType = val.compType
    })

  }

  @HostListener('window:resize', ['$event'])
  resizeWindow() {
    this.transEnd()
  }

  transEnd() {
    let bound = this.mainContainer.nativeElement.getBoundingClientRect()
    this.cellService.tableResize$.next(bound)
    this.cellService.tableResizer$.next(bound)
  }

  selectMenu($event: string) {
    if ($event === 'delete') {
      this.isMenuHidden = true
      this.componentService.removeComponent(this.currentComponentID)
      this._modify = true
    }
     if ($event === 'edit') {
       this.openEditTextDialog(dialogOpenAnimationDuration, dialogCloseAnimationDuration)
     }

  }

  toolBarButtonClick($event: string) {
    switch ($event){
      case 'clear' :
        this.componentService.clearComponentList();
        this.modify = true
        break;
      case 'changed' :
        this.pushCurrentPage();
        //this.documentService.saveTemplate() ;
        this.modify = true
        break;
      case 'watch' :
        this.pushCurrentPage();
        this.openWatchDialog(dialogOpenAnimationDuration, dialogCloseAnimationDuration)
        break;

    }
  }

  private pushCurrentPage() {
    if (this.currentDoc && this.currentStep) {
      this.documentService.addTemplate(this.currentDoc, this.currentStep, this.componentService.componentCollection)
    }
  }

  openEditTextDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    let componentRef = this.dialog.open(EditTextComponent, {
      width: '' + (window.innerWidth - (window.innerWidth/2)) + 'px',
      enterAnimationDuration,exitAnimationDuration});

    let currentComponent = this.componentService.getComponent(this.currentComponentID)
    componentRef.componentInstance.startValue = currentComponent.value

    componentRef.componentInstance.text.subscribe(value =>{
      if(currentComponent.componentType === IceComponentType.TEXT)
        currentComponent.setValue(value)
        this._modify = true
  })
  }

  openWatchDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {

    let componentRef = this.dialog.open(WatchTemplateComponent, {
      width: '' + (window.innerWidth - (window.innerWidth/5)) + 'px',
      height: '' + (window.innerHeight - (window.innerHeight/10)) + 'px',
      enterAnimationDuration,
      exitAnimationDuration,
      panelClass: 'bg-color'
    })

    componentRef.componentInstance.currentDocumentId = this.currentDoc.id
    componentRef.componentInstance.currentStepNum = this.currentStep.num

    componentRef.componentInstance.dialogCorrectX = window.innerWidth/5/2
    componentRef.componentInstance.dialogCorrectY = window.innerHeight/10/2
  }

  openTablesDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    let componentRef = this.dialog.open(ChangeTableComponent, {
      enterAnimationDuration,
      exitAnimationDuration,
    })

    componentRef.componentInstance.tableNum.subscribe(tableNum => {
      this.componentRef.instance.tableType = tableNum
      this.componentRef.instance.placeHolder = "Таблица - " + tableList.find(it => it.num === tableNum).text
      componentRef.close()
    })

  }

  setCurrentDocAndStep(docAndStep: any) {

    this.componentService.selectedComponent$.next(undefined)
    this.pushCurrentPage();

    this.componentService.clearComponentList()
    this.currentDocAndStep = docAndStep
    this.currentDoc = this.documentService.getDocById(docAndStep.currentDocumentId)
    if(this.currentDoc !== undefined)
      this.currentStep = this.currentDoc.children.find(p => p.num === docAndStep.currentStepNum)

    if(this.currentDoc && this.currentStep) {
      this.transEnd()
      this.restoreComponents(this.documentService.getComponentCollections(this.currentDoc, this.currentStep))
      this.currentStep.visible = this.documentService.getTemplateByDocId(this.currentDoc.id).docStep.find(s => s.stepNum === this.currentStep.num).visible
    }
  }

  private restoreComponents(componentCollections: ComponentMaket[]) {
    if(componentCollections.length < 1) return
    componentCollections.forEach(c => {
      this.createComponent(c.componentType.toString(),c)
    })
  }

  exit() {
    this.keycloakService.logoutAction().subscribe({
      complete:(() => this.router.navigate(["/"]))
    })
  }
}
