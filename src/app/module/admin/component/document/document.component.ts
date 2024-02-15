import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NestedTreeControl} from "@angular/cdk/tree";
import {MatTreeNestedDataSource} from "@angular/material/tree";
import {
  DocumentTreeTempl,
  IceDocumentMaket,
  ResponseTree,
  StepTreeTempl
} from "../../../../interfaces/interfaces";
import {DocumentService} from "../../../../services/document.service";
import {BackendService} from "../../../../services/backend.service";
import {MessageService} from "../../../../services/message.service";
import {
  dialogCloseAnimationDuration,
  dialogOpenAnimationDuration,
  ERROR,
  INFO,
  MAKET_DELETE_ERROR,
  MAKET_NAME_LOAD_ERROR
} from "../../../../constants";
import {ComponentService} from "../../../../services/component.service";
import {ComponentType} from "@angular/cdk/overlay";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {BankDocumentListComponent} from "../../../operator/component/bank-document-list/bank-document-list.component";
import {DocumentSettingsComponent} from "../document-settings/document-settings.component";
import {StepSettingsComponent} from "../step-settings/step-settings.component";


@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css'],
})
export class DocumentComponent implements OnInit {
  treeControl = new NestedTreeControl<any>(node => node.children);
  dataSource = new MatTreeNestedDataSource<DocumentTreeTempl>();
  currentDocument: DocumentTreeTempl
  currentStep: StepTreeTempl
  isPanelOpen = true
  isDocHover = false
  isStepHover = false
  docHover: DocumentTreeTempl
  stepHover: DocumentTreeTempl
  private _addDocPanel = false;
  isDocEdit = false
  currentEditDoc: DocumentTreeTempl
  newStepName: string
  isStepEdit = false
  currentEditStep: StepTreeTempl
  currentEditId: number
  private _newDocName: any
  private _isModified: boolean = false
  hasChild = (_: number, node: DocumentTreeTempl) => !!node.children && node.children.length > 0;


  @Input()
  docPanelCurrentSize: number;
  @Input()
  docPanelOpenWidth: number;
  @Output()
  openPanel = new EventEmitter()
  @Output()
  currentDocAndStep = new EventEmitter()

   set isModified(value: boolean) {
    this._isModified = value;
    if (this.currentStep != undefined) {
      this.documentService.getDocById(this.currentStep.parentId).isModified = value
    }
  }

  get isModified(): boolean {
    return this._isModified;
  }

  get addDocPanel(): boolean {
    return this._addDocPanel;
  }

  set addDocPanel(value: boolean) {
    this._addDocPanel = value;
  }

  set newDocName(value: any) {
    this._newDocName = value;
  }

  get newDocName(): any {
    return this._newDocName;
  }

  constructor(protected documentService: DocumentService,
              private backendService: BackendService,
              private messageService: MessageService,
              private componentService: ComponentService,
              public dialog: MatDialog
              ) {
    this.loadMaketNameList()
  }

  loadMaketNameList() {
    this.backendService.getMaketNameList().subscribe(
      {
        next: ((res) => {
          let respTree = res.content as ResponseTree[]

          respTree.forEach(maket => {
            let steps: StepTreeTempl[] = []
            maket.docStep.forEach(step => {
              steps.push({num: step.stepNum, name: step.stepName, parentId: maket.id,visible: step.visible})
            })
            this.documentService.docTree.push({
              id: maket.id,
              name: maket.docName,
              children: steps,
              isActive: maket.isActive,
              isModified: false
            })
          })
          this.refreshTree()
        }),
        error: ((err) => {
          this.messageService.show(MAKET_NAME_LOAD_ERROR, err.message, ERROR)
        })
      }
    )
  }

  refreshTree() {
    this.dataSource.data = null
    this.dataSource.data = this.documentService.getDocumentMaketList()
  }

  ngOnInit(): void {
    this.componentService.isModifyed$.subscribe({
      next:(val => this.isModified = val )
    })
  }

  documentChange(doc: DocumentTreeTempl) {
    this.currentDocument = doc
  }

  stepChange(step: StepTreeTempl) {
    if(step.num === 0) return
    if(this.isStepEdit === true){
      this.clearEditStepData();
    }

    this.currentStep = step
    this.currentDocument = this.documentService.getDocById(step.parentId)
    this.currentDocAndStep.next(
      {
        currentStepNum: step.num,
        currentDocumentId: this.currentDocument.id
      }
    )
  }

  addNewDoc() {
    let newDoc: DocumentTreeTempl = undefined
    if (this.isDocEdit) {
      this.backendService.editMaketName(this.currentEditDoc.id, {
        docName: this.newDocName,
        isActive: this.currentEditDoc.isActive
      }).subscribe(res => {
        this.currentDocument.name = res.docName
      })
    } else {
      this.isModified = true
      let newId = this.documentService.getNextDocId() * -1
      newDoc = {
        id: newId,
        name: this.newDocName,
        children: [{
          num: 1,
          name: "Страница 1",
          parentId: newId,
        }],
        isActive: true,
        isModified: true
      }

      this.documentService.addDoc(newDoc)
      this.documentService.addDocToTemplate(newDoc)
      this.refreshTree()
    }

    this.currentEditDoc = undefined
    this.closeDocPanel()
  }

  closeDocPanel() {
    this.newDocName = ""
    this.addDocPanel = false
  }

  /**Удаление макета*/
  delDoc(doc: DocumentTreeTempl) {
    this.messageService.show("Удалить макет?", "Макет будет удален безвозвратно!", INFO,["YES", "CANCEL"])
      .subscribe({
      next: value => {
        if(value === "YES") {
          this.deleteMaket(doc)
        }
      },
      error: err => {}
    })
  }

  deleteMaket(doc: DocumentTreeTempl){
    this.backendService.deleteMaket(doc.id).subscribe({
      next: (res => {
        this.isModified = false
        this.documentService.deleteDoc(doc)
        this.refreshTree()
        if (this.currentDocument != undefined && this.currentDocument.id === doc.id) {
          this.currentDocAndStep.next(
            {
              currentStepNum: undefined,
              currentDocumentId: undefined
            })
        }
      }),
      error: (err => {
        this.messageService.show(MAKET_DELETE_ERROR, err.error.message, ERROR)
      })
    })
  }

  editDoc(doc: DocumentTreeTempl) {
    this.newDocName = doc.name
    this.currentEditDoc = doc
    this._addDocPanel = true
    this.isDocEdit = true
  }

  addStep(doc: DocumentTreeTempl) {
    this.currentDocAndStep.next(
      {
        currentStepNum: undefined,
        currentDocumentId: undefined
      })

    this.isModified = true
    this.currentEditDoc = doc
    let newStepNum = this.documentService.getNextStepNumber(doc)
    this.currentEditStep = {
      num: newStepNum,
      name: "Страница " + newStepNum,
      parentId: doc.id,
      visible: true
    }

    this.documentService.addStep(doc, this.currentEditStep)
    this.refreshTree()
    this.currentDocument = this.documentService.getDocById(doc.id)
    this.currentDocument.isModified = true

    this.currentEditDoc = undefined
    this.currentEditStep = undefined

  }

  enterStep(stepHover: StepTreeTempl) {
    this.isModified = true
    if (this.isStepEdit) {
      stepHover.name = this.newStepName
      stepHover.num = this.currentEditId
      this.documentService.getTemplateByDocId(stepHover.parentId).docStep.find(p => p.stepNum === stepHover.num).stepName = this.newStepName
      this.currentDocument.children.find(p => p.num === stepHover.num).name = this.newStepName
    } else {
      this.currentEditStep.name = this.newStepName
      this.currentEditStep.num = this.documentService.getNextStepNumber(this.currentEditDoc)
      this.refreshTree()
    }
    this.clearEditStepData();
  }

  private clearEditStepData() {
    this.currentEditStep.num = this.currentEditId
    this.currentEditDoc = undefined
    this.currentEditStep = undefined
    this.currentEditId = undefined
    this.isStepEdit = false
  }

  delStep(stepHover: StepTreeTempl) {
    this.isModified = true

    let doc = this.documentService.getDocById(stepHover.parentId)
    if (doc.children.length === 1)
      this.delDoc(doc)
    else
      this.documentService.deleteStep(stepHover)

    this.refreshTree()

    if (this.currentStep != undefined && this.currentStep.num === stepHover.num) {
      this.currentDocument = undefined
      this.currentDocAndStep.next(
        {
          currentStepNum: undefined,
          currentDocumentId: undefined
        })
    }

  }

  editStep(stepHover: StepTreeTempl) {
    this.isStepEdit = true
    this.currentEditStep = stepHover
    this.currentEditId = stepHover.num
    this.newStepName = stepHover.name
    stepHover.num = 0
  }

  handleFileSelect(evt: any) {
    let files = evt.target.files;
    let f = files[0];
    let reader = new FileReader();
    reader.readAsText(f);
    reader.onload = (f => {
      return e => {
        // @ts-ignore
        let loadedMaket: IceDocumentMaket = JSON.parse(e.target.result)
        loadedMaket.docId = loadedMaket.docId * -1
        this.documentService.setTemplateList([loadedMaket])
        this.refreshTree()
        this.isModified = true
      };
    })(f);
  }

  docToggle(isOpen: boolean, id: number) {
    if (id < 0) return
    let templ = this.documentService.getTemplateByDocId(id)
    this.currentDocument = this.documentService.getDocById(id)
    let isLoaded = false
    if (templ != undefined)
      isLoaded = templ.isLoaded
    if (isOpen && !isLoaded)
      this.backendService.getMaketFull(id).subscribe({
        next: ((res) => {
          this.documentService.pushTemplate(
            {
              docId: res.id,
              isActive: res.isActive,
              docName: res.docName,
              docStep: res.docStep,
              isLoaded: true,
              docAttrib: res.docAttrib,
            }
            )
          //this.normalizeComponentId() Если в друг произошло за двоение ид компонентов(чего быть не должно!!!) можно это запустить для нормализации идешек.
        }),
      })
  }

  saveChanges() {

    if (this.currentStep && this.currentDocument) {
      this.currentStep.visible = this.documentService.getStep(this.currentDocument.id, this.currentStep.num).visible
      this.documentService.addTemplate(this.currentDocument, this.currentStep, this.componentService.componentCollection)
    }

    this.documentService.getDocumentMaketList().filter(p => p.isModified).forEach(m => {
      let modifyedMaket = this.documentService.getTemplateByDocId(m.id)
      if (modifyedMaket.docId < 0) {
        this.backendService.createMaket(modifyedMaket).subscribe({
          next: (res => {
            let newDocTree = this.documentService.getDocById(modifyedMaket.docId)
            newDocTree.id = res.id
            newDocTree.isModified = false
            modifyedMaket.docId = res.id
            let i
            for (i = 0; i < newDocTree.children.length; i++) {
              newDocTree.children[i].parentId = res.id
            }
            this.refreshTree()
            this.isModified = false
          }),
          error: (err => this.messageService.show("Ошибка  сохранения макета",err.error.message,ERROR))
        })
      } else {
        this.backendService.updateMaket(modifyedMaket).subscribe({
          next: (() => {
            this.documentService.getDocById(modifyedMaket.docId).isModified = false
            this.refreshTree()
            this.isModified = false
          }),
          error: (err => this.messageService.show("Ошибка  сохранения макета", err.error.message, ERROR))
        })
      }
    })

  }

  uploadCurrentMaket() {
    this.documentService.saveTemplate(this.currentDocument)
  }

  // private normalizeComponentId() {
  //   let componentIdArray = this.documentService.getTemplateByDocId(this.currentDocument.id).docStep.map(s => s.componentMaket).flat(1).map(c => c.componentID)
  //   let dublArray = new Array(400)
  //   dublArray.fill(0,0,199)
  //
  //   componentIdArray.forEach(id => {
  //     dublArray[id] ++
  //   })
  //
  //   let maxID = this.documentService.getMaxComponentID(this.currentDocument.id) + 1
  //
  //   for (let i = 0; i < dublArray.length; i++){
  //     if(dublArray[i] > 1) {
  //       let component: ComponentMaket[] = this.documentService.getTemplateByDocId(this.currentDocument.id).docStep.map(s => s.componentMaket).flat(1).filter(c => c.componentID === i)
  //       for(let c = 1; c < component.length; c++){
  //         component[c].componentID = maxID ++
  //       }
  //     }
  //   }
  //
  //   componentIdArray = this.documentService.getTemplateByDocId(this.currentDocument.id).docStep.map(s => s.componentMaket).flat(1).map(c => c.componentID)
  // }
  stepSettings(stepNode: StepTreeTempl) {
    console.log(stepNode)
    let componentRef = this.openDialog(dialogOpenAnimationDuration, dialogCloseAnimationDuration,StepSettingsComponent)

  }

  documentSettings(docNode: DocumentTreeTempl) {
    let currentMaket: IceDocumentMaket = this.documentService.getTemplateByDocId(docNode.id)
    let componentRef = this.openDialog(dialogOpenAnimationDuration, dialogCloseAnimationDuration,DocumentSettingsComponent)
    componentRef.componentInstance.currentMaket = currentMaket
    componentRef.afterClosed().subscribe({
      next: value => {
        if(value === 1) {
          this.documentService.getDocById(currentMaket.docId).isModified = true
          this.isModified = true
        }
      }
    })
  }


  openDialog<T>(enterAnimationDuration: string, exitAnimationDuration: string, component: ComponentType<T>): MatDialogRef<any> {
    return this.dialog.open(component, {
      width: '' + (window.innerWidth * 0.8) + 'px',
      height: '' + (window.innerHeight * 0.8) + 'px',
      enterAnimationDuration,
      exitAnimationDuration,
    })
  }

}
