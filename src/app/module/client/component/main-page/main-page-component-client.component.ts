import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {User} from "../../../../model/User";
import {DOCUMENT_LOAD_ERROR, ERROR, TAB_DOCUMENT_LIST, TAB_DOCUMENT_SHOW} from "../../../../constants";
import {MessageService} from "../../../../services/message.service";
import {BackendService} from "../../../../services/backend.service";
import {EventObject, IceDocument, OpenDocType, ResponseTree} from "../../../../interfaces/interfaces";
import {DocumentEditorComponent} from "../document-editor/document-editor.component";
import {TabService} from "../../../../services/tab.service";
import {filter, Subscription} from "rxjs";
import {Router} from "@angular/router";
import {TimeService} from "../../../../services/time.service";
import {KeycloakService} from "../../../../services/keycloak.service";
import {EventService} from "../../../../services/event.service";
import {WorkerService} from "../../../../services/worker.service";
import {DataSourceService} from "../../../../services/data-source.service";

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page-component-client.component.html',
  styleUrls: ['./main-page.css']
})
export class MainPageComponentClient implements AfterViewInit, OnDestroy, OnInit {
  currentTabNum: number
  user:User
  changeDocId: number | undefined
  openedDocument: IceDocument;
  tempOpenedComponent: IceDocument;
  onTabChanged$: Subscription
  requestUserProfile$: Subscription
  getDocumentFull$: Subscription
  openDocType: OpenDocType = undefined
  protected maketId: number | undefined = undefined


  @ViewChild(DocumentEditorComponent) editorComponent: DocumentEditorComponent;
  tabDone: boolean;

  constructor(private messageService: MessageService,
              private backService: BackendService,
              private tabService: TabService,
              private router: Router,
              private timeService: TimeService,
              private keycloakService: KeycloakService,
              private eventService: EventService,
              private workerService: WorkerService,
              private dataSourceService: DataSourceService,
              private backendService: BackendService) {
    /**Разрешить обновление токенов*/
    timeService.isRefreshToken = true

    let userString = localStorage.getItem("user")
    if(userString)
      this.user = JSON.parse(userString)

    if(this.user.roles.length < 1 || !this.user.roles.includes("ROLE_user"))
      this.router.navigate(["/"])

    this.onTabChanged$ = tabService.onTabChanged().subscribe(tab => this.currentTabNum = tab)

    this.backendService.getMaketNameList().subscribe(res => {
      let respTree = (res.content as ResponseTree[]).filter(value => value.isActive)
       if(respTree.length === 1)
        this.maketId = respTree[0].id
      else
         this.maketId = undefined
    })
  }

  ngOnInit(): void {
    }

  ngOnDestroy(): void {
    if(this.requestUserProfile$)
      this.requestUserProfile$.unsubscribe()
    if(this.onTabChanged$)
      this.onTabChanged$.unsubscribe()
    if(this.getDocumentFull$)
      this.getDocumentFull$.unsubscribe()
    }

  ngAfterViewInit(): void {
    let header = document.getElementsByClassName('mat-mdc-tab-header')
    if(header[0])
      header[0].setAttribute("style", "display:none")

  }

  openDoc(doc: {"rowId": number, "openType": OpenDocType}) {
    this.openDocType = doc.openType
    this.changeDocId = doc.rowId
    this.loadDocumentForEdit(doc.rowId)
  }

  loadDocumentForEdit(id: number){
    this.getDocumentFull$ = this.backService.getDocumentFull(id).subscribe({
      next: ((res: IceDocument) => {
        if(!res) return

        /**Создаем воркеры*/
        if(res.docAttrib && res.docAttrib.workerList)
          this.workerService.createWorker(res)
        /**Создаем источники данных*/
        this.dataSourceService.createDataSourceList(res)

        /**Создаем событие открытие документа*/
        if(!this.eventService.isWorkerResize)
          this.eventService.launchEvent(EventObject.ON_DOCUMENT_OPEN, res,res.docAttrib.documentEventList)
        else
          this.eventService.isWorkerResize = false

        this.tempOpenedComponent = res
        //this.openedDocument = res
        this.currentTabNum = TAB_DOCUMENT_SHOW

      }),
      error: (err => {
        this.messageService.show(DOCUMENT_LOAD_ERROR,err.error.message,ERROR)
      })
    })

  }

  tabChangeDone() {
    if(this.currentTabNum === TAB_DOCUMENT_LIST){
      this.openedDocument = undefined
      this.openDocType = undefined
    }
    if(this.tempOpenedComponent && this.currentTabNum === TAB_DOCUMENT_SHOW){
      this.openedDocument = this.tempOpenedComponent
      this.tempOpenedComponent = undefined
    }
    this.tabDone = this.currentTabNum === TAB_DOCUMENT_SHOW
  }

  exit() {
    /**Нужно сохранить документ если были изменения*/
    if(DocumentEditorComponent.instance.currentDocument && DocumentEditorComponent.instance.currentDocument.changed)
      DocumentEditorComponent.instance.saveDoc(undefined,0)

    this.keycloakService.logoutAction().subscribe({
      complete:(() => this.router.navigate(["/"]))
    })
  }

  openDocList() {
    /**Нужно сохранить документ если были изменения*/
    if(DocumentEditorComponent.instance.currentDocument.changed) {
      DocumentEditorComponent.instance.saveDoc(undefined, 0)
      let subs = DocumentEditorComponent.instance.savedIsDone$.subscribe(value => {
        console.log("save is done ", value)
        if(value === true)
          this.tabService.openTab(TAB_DOCUMENT_LIST)
        subs.unsubscribe()
      })
    } else{
      this.tabService.openTab(TAB_DOCUMENT_LIST)
    }
  }

}
