import {AfterViewInit, Component, OnDestroy, ViewChild} from '@angular/core';
import {User} from "../../../../model/User";
import {DOCUMENT_LOAD_ERROR, ERROR, TAB_DOCUMENT_SHOW} from "../../../../constants";
import {MessageService} from "../../../../services/message.service";
import {BackendService} from "../../../../services/backend.service";
import {IceDocument} from "../../../../interfaces/interfaces";
import {DocumentEditorComponent} from "../document-editor/document-editor.component";
import {TabService} from "../../../../services/tab.service";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";
import {TimeService} from "../../../../services/time.service";

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page-component-client.component.html',
  styleUrls: ['./main-page.css']
})
export class MainPageComponentClient implements AfterViewInit, OnDestroy {
  currentTabNum: number
  user:User
  changeDocId: number | undefined
  openedComponent: IceDocument;
  tempOpenedComponent: IceDocument;
  onTabChanged$: Subscription
  requestUserProfile$: Subscription
  getDocumentFull$: Subscription

  @ViewChild(DocumentEditorComponent) editorComponent: DocumentEditorComponent;

  constructor(private messageService: MessageService,
              private backService: BackendService,
              tabService: TabService,
              private router: Router,
              private timeService: TimeService) {
    /**Разрешить обновление токенов*/
    timeService.isRefreshToken = true

    this.requestUserProfile$ = backService.requestUserProfile().subscribe({
      next: value => {
        if(value && ((value.roles as Array<string>).includes("ROLE_operator") || (value.roles as Array<string>).includes("ROLE_user"))) return
        this.router.navigate(["/"])
      },
      error: (() => this.router.navigate(["/"]))
    })

    let userString = localStorage.getItem("user")
    if(userString)
      this.user = JSON.parse(userString)


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
  }

  openDoc(doc: number) {
    this.changeDocId = doc
    this.loadDocumentForEdit(doc)
  }

  loadDocumentForEdit(id: number){
    this.getDocumentFull$ = this.backService.getDocumentFull(id).subscribe({
      next: ((res: IceDocument) => {
        this.tempOpenedComponent = res
        this.currentTabNum = TAB_DOCUMENT_SHOW
      }),
      error: (err => this.messageService.show(DOCUMENT_LOAD_ERROR,err.message,ERROR))
    })

  }

  tabChangeDone() {
    if(this.tempOpenedComponent && this.currentTabNum === TAB_DOCUMENT_SHOW){
      this.openedComponent = this.tempOpenedComponent
      this.tempOpenedComponent = undefined
    }
  }

}
