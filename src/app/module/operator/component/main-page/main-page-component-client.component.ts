import {AfterViewInit, Component, OnDestroy, ViewChild} from '@angular/core';
import {User} from "../../../../model/User";
import {DOCUMENT_LOAD_ERROR, ERROR, TAB_DOCUMENT_LIST, TAB_DOCUMENT_SHOW} from "../../../../constants";
import {MessageService} from "../../../../services/message.service";
import {BackendService} from "../../../../services/backend.service";
import {IceDocument, OpenDocType} from "../../../../interfaces/interfaces";
import {DocumentEditorComponent} from "../document-editor/document-editor.component";
import {TabService} from "../../../../services/tab.service";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";
import {TimeService} from "../../../../services/time.service";
import {KeycloakService} from "../../../../services/keycloak.service";

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page-component-client.component.html',
  styleUrls: ['./main-page.css']
})
export class MainPageComponentClient implements AfterViewInit, OnDestroy {
  currentTabNum: number
  user:User
  changeDocId: number | undefined
  openedDocument: IceDocument;
  tempOpenedComponent: IceDocument;
  onTabChanged$: Subscription
  requestUserProfile$: Subscription
  getDocumentFull$: Subscription
  openDocType: OpenDocType | undefined = undefined

  @ViewChild(DocumentEditorComponent) editorComponent: DocumentEditorComponent;

  constructor(private messageService: MessageService,
              private backService: BackendService,
              private tabService: TabService,
              private router: Router,
              private timeService: TimeService,
              private keycloakService: KeycloakService) {
    /**Разрешить обновление токенов*/
    timeService.isRefreshToken = true

    let userString = localStorage.getItem("user")
    if(userString)
      this.user = JSON.parse(userString)

    if(this.user.roles.length < 1 || !this.user.roles.includes("ROLE_operator"))
      this.router.navigate(["/"])

    this.onTabChanged$ = tabService.onTabChanged().subscribe(tab => this.currentTabNum = tab)
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
        this.tempOpenedComponent = res
        this.currentTabNum = TAB_DOCUMENT_SHOW
      }),
      error: (err => {
        this.messageService.show(DOCUMENT_LOAD_ERROR,err.error.message,ERROR)
      })
    })

  }

  tabChangeDone() {
    if(this.currentTabNum == TAB_DOCUMENT_LIST){
      this.openedDocument = undefined
    }
    if(this.tempOpenedComponent && this.currentTabNum === TAB_DOCUMENT_SHOW){
      this.openedDocument = this.tempOpenedComponent
      this.tempOpenedComponent = undefined
    }
  }

  exit() {
    /**Нужно сохранить документ если были изменения*/
    if(DocumentEditorComponent.instance.currentDocument && DocumentEditorComponent.instance.currentDocument.changed)
      DocumentEditorComponent.instance.saveControl()

    this.keycloakService.logoutAction().subscribe({
      complete:(() => this.router.navigate(["/"]))
    })
  }

  openDocList() {
    /**Нужно сохранить документ если были изменения*/
    if(DocumentEditorComponent.instance.currentDocument.changed) {
      DocumentEditorComponent.instance.updateDoc(DocumentEditorComponent.instance.currentDocument.status)
      let subs = DocumentEditorComponent.instance.savedIsDone$.subscribe(value => {
        if(value === true)
          this.tabService.openTab(TAB_DOCUMENT_LIST)
        subs.unsubscribe()
      })
    } else{
      this.tabService.openTab(TAB_DOCUMENT_LIST)
    }
  }

  // openDocList() {
  //   /**Нужно сохранить документ если были изменения*/
  //   if(DocumentEditorComponent.instance.currentDocument.changed)
  //     DocumentEditorComponent.instance.updateDoc(DocumentEditorComponent.instance.currentDocument.status)
  //   this.tabService.openTab(TAB_DOCUMENT_LIST)
  // }
}
