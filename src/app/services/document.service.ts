import {ComponentRef, Injectable} from '@angular/core';
import {
  ComponentMaket,
  DocumentTreeTempl,
  IceDocumentMaket,
  IceStepMaket,
  StepTreeTempl
} from "../interfaces/interfaces";
import {IceMaketComponent} from "../module/admin/classes/icecomponentmaket";
import {IceComponentType} from "../constants";

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  docTree: DocumentTreeTempl[] = []
  templateList: Array<IceDocumentMaket> = []
  lastComponentIndex = 0

  constructor() {
  }

  calculateComponentId() {
    this.lastComponentIndex = this.templateList
      .map(item => item.docStep.map(i => i.componentMaket.length)
      .reduce((r, i) => r += i, 0))
      .reduce((r, i) => r += i, 0)
    console.log("this.lastComponentIndex: ", this.lastComponentIndex)
  }



  getMaketComponentList(docId: number,selfId: number){
    let resultArr = Array()
    this.templateList.filter(p => p.docId === docId)[0].docStep.forEach(c => {
      let compArr = Array()
      c.componentMaket.forEach(i =>{
        if(i.componentID != selfId
          && ((i.componentType === IceComponentType.INPUT && i.inputType === "checkbox") || i.componentType === IceComponentType.SELECT))
          compArr.push({componentID: i.componentID, componentName: i.componentName, componentType: i.componentType,inputType: i.inputType})
      })
      if(compArr.length > 0)
        resultArr.push({stepName: c.stepName, component: compArr})
    })
    return resultArr
  }

  setTemplateList(tempList: IceDocumentMaket[]) {
    this.templateList = tempList

    this.templateList.forEach(d => {
      let childList = new Array<StepTreeTempl>()
      d.docStep.forEach(c => {
        childList.push({num: c.stepNum, name: c.stepName, parentId: d.docId})
      })
      this.docTree.push({id: d.docId, name: d.docName, children: childList, isActive: true})
    })
  }

  pushTemplate(maket: IceDocumentMaket) {
    this.templateList.push(maket)
    let childList = new Array<StepTreeTempl>()
    maket.docStep.forEach(c => {
      childList.push({num: c.stepNum, name: c.stepName, parentId: maket.docId})
    })

    let docMaket = this.docTree.find(p => p.id === maket.docId)
    if(docMaket)
      docMaket.children = childList


    this.calculateComponentId()
  }


  // saveTemplate(){
  //     let blob = new Blob([JSON.stringify(this.templateList, null, 2)], {type: 'application/json'});
  //     FileSaver.saveAs(blob, "template.JSON");
  // }

  addDocToTemplate(doc: DocumentTreeTempl) {
    doc.children.forEach(step => {
      this.addTemplate(doc, step)
    })
  }

    addTemplate(doc: DocumentTreeTempl, step: StepTreeTempl, refComponentList?: ComponentRef<IceMaketComponent>[]) {
    if(step.num === 0) return

    let isDocPresent = this.templateList.find(p => p.docId === doc.id)
    let compList = new Array<ComponentMaket>()
    if (refComponentList != undefined)
      refComponentList.forEach(p => {
        compList.push(p.instance.getCompanentMaket())
      })

    let newStep: IceStepMaket = {
      stepNum: step.num,
      stepName: step.name,
      componentMaket: compList
    }


    if (isDocPresent === undefined) { //Сохраняем новый шаблон
      let newTempl: IceDocumentMaket = {
        docId: doc.id,
        docName: doc.name,
        docStep: [newStep]
      }
      this.templateList.push(newTempl)
      this.calculateComponentId()
    } else { //Правим существующий
      isDocPresent.docName = doc.name
      let isStepPresent = isDocPresent.docStep.find(p => p.stepNum === step.num)

      if (isStepPresent === undefined) { // новый шаг сохраняем
        isDocPresent.docStep.push(newStep)
      } else { //Правим существующий
        isStepPresent.stepName = step.name
        isStepPresent.componentMaket = compList
      }
    }
  }

  getTemplateByDocId(docId: number): IceDocumentMaket {
    return this.templateList.find(p => p.docId === docId)
  }

  getComponentCollections(doc: DocumentTreeTempl, step: StepTreeTempl): ComponentMaket[] {
    let lDoc = this.templateList.find(p => p.docId === doc.id)
    if (lDoc === undefined) return []
    let lStep = lDoc.docStep.find(p => p.stepNum === step.num)
    if (lStep === undefined) return []
    return lStep.componentMaket
  }

  deleteTemplate(docId: number) {
    let lDoc = this.templateList.find(p => p.docId === docId)
    if (lDoc === undefined) return
    this.templateList.splice(this.templateList.findIndex(p => p.docId === docId), 1)
  }

  deleteTemplateStep(docId: number, stepNUm: number) {
    if (this.templateList.length < 1) return
    let step = this.templateList.find(p => p.docId === docId).docStep
    if (step.length == 1)
      this.deleteTemplate(docId)
    else
      step.splice(step.findIndex(p => p.stepNum === stepNUm), 1)
  }


  getStep(docId: number, stepNum: number): StepTreeTempl {
    return this.getDocById(docId).children.find(p => p.num === stepNum)
  }

  getDocById(docId: number): DocumentTreeTempl {
    if (docId === undefined) return undefined
    return this.docTree.find(p => p.id === docId)
  }

  getDocumentMaketList() {
    this.docTree.sort((a, b) => {
      return a.id - b.id
    })
    return this.docTree
  }

  addDoc(newDoc: DocumentTreeTempl) {
    this.docTree.push(newDoc)
  }

  deleteDoc(doc: DocumentTreeTempl) {
    this.docTree.splice(this.docTree.findIndex(p => p.id === doc.id), 1)
    this.deleteTemplate(doc.id)
  }

  addStep(doc: DocumentTreeTempl, step: StepTreeTempl) {
    doc.isModified = true
    this.docTree.find(p => p.id === doc.id).children.push(step)
    this.addTemplate(doc, step)
  }

  deleteStep(step: StepTreeTempl) {
    let children = this.docTree.find(p => p.id === step.parentId).children
    this.deleteTemplateStep(step.parentId, step.num)
    children.splice(children.findIndex(p => p.num === step.num), 1)
    this.getDocById(step.parentId).isModified = true
  }

  getNextStepNumber(doc: DocumentTreeTempl) {
    let maxStepNumber = 0
    this.docTree.find(p => p.id === doc.id).children.forEach(s => {
      if (s.num > maxStepNumber)
        maxStepNumber = s.num
    })
    return maxStepNumber + 1
  }

  getNextDocId() {
    let nextId = 0
    this.docTree.forEach(p => {
      if(p.id < 0 && (p.id *-1) > nextId) nextId = (p.id * -1)
      if (p.id > 0 && p.id > nextId) nextId = p.id
    })
    return nextId + 1
  }


}
