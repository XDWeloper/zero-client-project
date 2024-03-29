import {AfterViewInit, Component, ComponentRef, ElementRef, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {cellColl, cellRow, CellType, collInRow, IceComponentType} from "../../../../constants";
import {MatDialogRef} from "@angular/material/dialog";
import {DocumentService} from "../../../../services/document.service";
import {IceComponent, IceDocumentMaket} from "../../../../interfaces/interfaces";
import {CellService} from "../../../../services/cell.service";
import {MatStepper} from "@angular/material/stepper";
import {TextComponent} from "../../../../component/dinamicComponent/text/text.component";
import {InputComponent} from "../../../../component/dinamicComponent/input/input.component";
import {AreaComponent} from "../../../../component/dinamicComponent/area/area.component";
import {
  InformationMainCounterpartiesTableComponent
} from "../../../../component/dinamicComponent/tables/information-main-counterparties-table/information-main-counterparties-table.component";
import {
  InformationCompanyParticipantsTableComponent
} from "../../../../component/dinamicComponent/tables/information-company-participants-table/information-company-participants-table.component";
import {UploadComponent} from "../../../../component/dinamicComponent/upload/upload.component";
import {AddressComponent} from "../../../../component/dinamicComponent/adress/address.component";
import {SelectComponent} from "../../../../component/dinamicComponent/select/select.component";

@Component({
  selector: 'app-watch-template',
  templateUrl: './watch-template.component.html',
})
export class WatchTemplateComponent implements OnInit,AfterViewInit {

  cellRowList: any;
  cellInnerList: any;
  cellColl: number
  cellType: CellType = CellType.client
  private _currentDocumentId: number
  currentDocument: IceDocumentMaket
  currentStepIndex = 1


  @ViewChild("stepper", {static: false})
  private stepper: MatStepper;

  @ViewChild("watch_mainContainer", {static: false})
  private mainContainer: ElementRef;

  @ViewChild('watch_field', {read: ViewContainerRef})
  private itemsField: ViewContainerRef | undefined

  private componentRef: ComponentRef<IceComponent>
  dialogCorrectX: number;
  dialogCorrectY: number;
  private _currentStepNum: number;


  set currentStepNum(value: number) {
    this._currentStepNum = value;
    setTimeout(() => this.setCurrentStep(value), 500)
  }

  constructor(public dialogRef: MatDialogRef<WatchTemplateComponent>,
              private documentService: DocumentService,
              private cellService: CellService) {
  }

  ngAfterViewInit() {
    //setTimeout(() => this.setCurrentStep(1), 500)
  }


  set currentDocumentId(value: number) {
    this._currentDocumentId = value;
    this.currentDocument = this.documentService.getTemplateByDocId(value)
  }

  ngOnInit(): void {
    this.cellColl = cellColl
    this.cellRowList = new Array(collInRow * cellRow).fill(null).map((_, i) => i + 1);
    this.cellInnerList = new Array(cellColl).fill(null).map((_, i) => i + 1);
  }

  close() {
    this.cellService.clearWatchList()
    this.dialogRef.close()
  }

  showComponentOnCurrentStep(stepNum: number) {
    let stepComponentList = this.currentDocument.docStep.find(p => p.stepNum === stepNum).componentMaket

    stepComponentList.forEach(comp => {
      if (comp.componentType === IceComponentType.SELECT)
        this.componentRef = this.itemsField.createComponent(SelectComponent);
      if (comp.componentType === IceComponentType.PLACE)
        this.componentRef = this.itemsField.createComponent(AddressComponent);
      if (comp.componentType === IceComponentType.TEXT)
        this.componentRef = this.itemsField.createComponent(TextComponent);
      if (comp.componentType === IceComponentType.INPUT)
        this.componentRef = this.itemsField.createComponent(InputComponent);
      if (comp.componentType === IceComponentType.AREA)
        this.componentRef = this.itemsField.createComponent(AreaComponent);
      if (comp.componentType === IceComponentType.UPLOAD)
        this.componentRef = this.itemsField.createComponent(UploadComponent);
      if (comp.componentType === IceComponentType.TABLE) {
        switch (comp.tableType){
          case 1: this.componentRef = this.itemsField.createComponent(InformationMainCounterpartiesTableComponent); break;
          case 2: this.componentRef = this.itemsField.createComponent(InformationCompanyParticipantsTableComponent); break;
        }
      }

      let compInstance = this.componentRef.instance

      compInstance.componentType = comp.componentType
      compInstance.inputType = comp.inputType
      compInstance.value = comp.value
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
      compInstance.optionList = comp.optionList
    })
  }


  setCurrentStep(index: number) {
    this.itemsField.clear()
    this.currentStepIndex = index
    this.showComponentOnCurrentStep(index)
  }
}
