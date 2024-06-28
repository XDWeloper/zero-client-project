import {ComponentRef, inject, Injectable} from '@angular/core';
import {
  ComponentMaket, DocStatus,
  DocumentTreeTempl,
  IceDocumentMaket,
  IceStepMaket, StepControl,
  StepTreeTempl
} from "../interfaces/interfaces";
import {IceMaketComponent} from "../module/admin/classes/icecomponentmaket";
import {IceComponentType} from "../constants";
import {saveAs} from "file-saver";
import {ComponentService} from "./component.service";

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  docTree: DocumentTreeTempl[] = []
  templateList: Array<IceDocumentMaket> = []
  lastComponentIndex = 0
  statusList:{status: string , name: string}[] = []

  private componentService = inject(ComponentService)

  constructor() {
    //this.statusList.push({status: "", name: ""})
    Object.keys(DocStatus).forEach((status, index) => {
      this.statusList.push({status: status, name: Object.values(DocStatus)[index]})
    })
  }

  removeComponent(componentID: number){
    //let index = this.templateList.map(item => item.docStep.map(item => item.componentMaket).flat()).flat().findIndex(item => item.componentID === componentID)

    this.templateList.map(item => item.docStep).flat().forEach(page => {
      let index = page.componentMaket.map(item => item.componentID).findIndex(v => v === componentID)
      if(index != -1){
        page.componentMaket.splice(index, 1)
      }

    })
  }

  removeSelectedComponents(){
    this.componentService.selectedComponentsId.forEach(id => this.removeComponent(id))
  }

  isComponentIdPresent(docId: number,id: number): boolean{
    return this.templateList
      .find(doc => doc.docId === docId)
      .docStep.map(step => step.componentMaket)
      .flat().map(c => c.componentID).includes(id)
  }

  getComponentByName(docId: number, component: IceMaketComponent):ComponentMaket | undefined {
    return this.templateList
      .find(doc => doc.docId === docId)
      .docStep.map(step => step.componentMaket)
      .flat().find(comp => comp.componentName === component.componentName && comp.componentID != component.componentID)
  }

  getComponentListFromSellected(docId: number):ComponentMaket[] | undefined {
    let sellectedArray = this.componentService.selectedComponentsId;
    return this.templateList
      .find(doc => doc.docId === docId)
      .docStep.map(step => step.componentMaket)
      .flat()
      .filter(comp => sellectedArray.includes(comp.componentID))
  }

  getMaxComponentID(id: number): number{
    return  Math.max(...this.getTemplateByDocId(id).docStep.map(s => s.componentMaket).flat(1).map(c => c.componentID))
  }

  getStatusListForSelect(): {status: string , name: string}[] {
    return this.statusList
  }

  calculateComponentId(docId: number) {
    let nextId = 0
    this.getTemplateByDocId(docId).docStep.map(s => s.componentMaket).flat().forEach(c => nextId = c.componentID > nextId ? c.componentID : nextId)
    this.lastComponentIndex = nextId
  }

  getStepComponentList(docId: number,selfId: number): StepControl[]{
    let cml = this.templateList.find(p => p.docId === docId).docStep.find(item => item.componentMaket.find(comp => comp.componentID === selfId))
    return [{stepName: cml.stepName, component: cml.componentMaket.sort((a, b) => a.componentID - b.componentID)}]
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
      this.docTree.push({id: d.docId, name: d.docName, children: childList, isActive: true, isModified: true})
    })
  }

  pushTemplate(maket: IceDocumentMaket) {
    this.templateList.push(maket)
    let childList = new Array<StepTreeTempl>()
    maket.docStep.forEach(c => {
      childList.push({num: c.stepNum, name: c.stepName, parentId: maket.docId,isToolBar: c.isToolBar != undefined ? c.isToolBar : true, visible: c.visible != undefined ? c.visible : true})
    })

    let docMaket = this.docTree.find(p => p.id === maket.docId)
    if(docMaket)
      docMaket.children = childList
    this.calculateComponentId(maket.docId)
  }

  saveTemplate(dtt: DocumentTreeTempl){
    if(!this.templateList.find(i => i.docId === dtt.id)) {
      return
    }
      let blob = new Blob([JSON.stringify(this.templateList.find(i => i.docId === dtt.id), null, 2)], {type: 'application/json'});
      saveAs(blob, dtt.name + "_макет.JSON");
      //FileSaver.saveAs(blob, dtt.name + "_макет.JSON");
  }

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
      componentMaket: compList,
      visible: step.visible,
      isToolBar: step.isToolBar,
      stepEvent: step.stepEvent
    }

    if (isDocPresent === undefined) { //Сохраняем новый шаблон
      let newTempl: IceDocumentMaket = {
        docId: doc.id,
        docName: doc.name,
        docStep: [newStep],
        docAttrib: {}
      }
      this.templateList.push(newTempl)
      this.calculateComponentId(doc.id)
    } else { //Правим существующий
      isDocPresent.docName = doc.name
      let isStepPresent = isDocPresent.docStep.find(p => p.stepNum === step.num)

      if (isStepPresent === undefined) { // новый шаг сохраняем
        isDocPresent.docStep.push(newStep)
      } else { //Правим существующий
        isStepPresent.stepName = step.name
        isStepPresent.componentMaket = compList
        isStepPresent.visible = step.visible
        isStepPresent.isToolBar = step.isToolBar
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

  getLastOrder(docId: number): number{
    let result = 0
    this.getTemplateByDocId(docId).docStep.map(s => s.componentMaket).flat().map(c => c.printRule.order).forEach(order => {
      if(order > result)
        result = order
    })
    return result
  }

}
