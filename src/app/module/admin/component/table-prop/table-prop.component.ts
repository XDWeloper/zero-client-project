import {AfterViewInit, ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {IceMaketComponent} from "../../classes/icecomponentmaket";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {Header, SubHeader, TableProperties} from "../../../../interfaces/interfaces";
import {NgClass, NgForOf, NgIf, NgStyle, NgSwitch, NgSwitchCase, NgTemplateOutlet} from "@angular/common";
import {IceInputComponent} from "../../../share-component/ice-input/ice-input.component";
import {NgxMaskDirective} from "ngx-mask";
import {FormsModule} from "@angular/forms";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {DomSanitizer} from "@angular/platform-browser";
import {from, max} from "rxjs";
import {map} from "rxjs/operators";
import {computeStartOfLinePositions} from "@angular/compiler-cli/src/ngtsc/sourcemaps/src/source_file";


@Component({
  selector: 'app-table-prop',
  templateUrl: './table-prop.component.html',
  styleUrls: ['./table-prop.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconModule,
    MatTooltipModule,
    NgForOf,
    IceInputComponent,
    NgIf,
    NgClass,
    NgTemplateOutlet,
    NgxMaskDirective,
    FormsModule,
    NgSwitch,
    NgSwitchCase,
    NgStyle,
    MatCheckboxModule
  ],
  standalone: true
})
export class TablePropComponent implements OnInit, AfterViewInit {
  currentTableComponent: IceMaketComponent
  tableProp: TableProperties
  currentHeader: Header
  currentSubHeader: SubHeader
  errorMessage: string | undefined
  fontSizeMask: string = "00";
  headerMaxHeight: number | undefined = undefined
  subHeaderMaxHeight: number | undefined = undefined

  observer = new ResizeObserver((entries) => {
    for (let entry of entries) {
      /**Есть изменения нужно поискать где*/
      this.setHeaderHeight()
    }
  });

  headerEl: Element

  constructor(public dialogRef: MatDialogRef<TablePropComponent>, public sanitizer: DomSanitizer) {
    this.tableProp = {
      header: []
    }
  }

  setHeaderHeight(){
    let headList = document.querySelectorAll(".headClass")
    let subHeadList = document.querySelectorAll(".subHeadClass")

    from(headList).pipe(
      map(value => value.clientHeight),
      max()
    ).subscribe(value => {
      this.headerMaxHeight = value
    })

    from(subHeadList).pipe(
      map(value => value.clientHeight),
      max()
    ).subscribe(value => this.subHeaderMaxHeight = value)
  }

  ngAfterViewInit(): void {
    this.initHeaderObservable()
    this.setHeaderHeight()
    }

  ngOnInit(): void {
    if (this.currentTableComponent.tableProp)
      this.tableProp = this.currentTableComponent.tableProp
  }

  initHeaderObservable(){
    if (!this.headerEl) {
      this.headerEl = document.querySelector(".headerContainerClass")
      this.observer.observe(this.headerEl)
    }
  }

  addColumn() {
    if (this.tableProp.header.length > 5) {
      this.errorMessage = "Таблица не может содержать более 6 колонок."
      return
    }
    let newTitleObject: Header = {
      title: "Колонка " + this.tableProp.header.length,
      order: this.tableProp.header.length,
      fontSize: 16,
      fontWeight: "bold",
      // bgColor: "#FFFFFF",
      // textColor: "#000000",
      fontItalic: false,
      subHeader: [{
        title: "",
        order: 0,
        column: {columnType: "area", defaultValue: ""},
        fontSize: 16,
        fontWeight: "normal",
        // bgColor: "#FFFFFF",
        // textColor: "#000000",
        fontItalic: false
      }]
    }

    let columnNum = this.tableProp.header.map(value => value.subHeader.length).reduce((previousValue, currentValue, currentIndex, []) => previousValue + currentValue, 0)
    newTitleObject.subHeader[0].title = this.tableProp.header.length === 0 ? "0" : "" + columnNum
    newTitleObject.subHeader[0].order = columnNum

    this.tableProp.header.push(newTitleObject)
    this.currentHeader = newTitleObject
    this.currentSubHeader = newTitleObject.subHeader[0]

    this.initHeaderObservable()

  }

  removeColumn() {
    let removeIndex = this.tableProp.header.findIndex(value => value.order === this.currentHeader.order)
    if (removeIndex != undefined) {
      this.tableProp.header.splice(removeIndex, 1)
      this.currentHeader = undefined
    }
  }

  addSubHeader() {
    this.currentHeader.subHeader.push({
      title: this.tableProp.header.length === 0 ? "0" : "" + this.tableProp.header.map(value => value.subHeader.length).reduce((previousValue, currentValue) => previousValue + currentValue),
      order: 0,
      column: {columnType: "area"},
      fontSize: 16,
      fontWeight: "normal",
      fontItalic: true
    })
    this.reorderSubHeader()
  }

  removeSubHeader() {
    let index = this.currentHeader.subHeader.findIndex(value => value === this.currentSubHeader)
    if (index != undefined)
      this.currentHeader.subHeader.splice(index, 1)
    if (this.currentHeader.subHeader.length < 1)
      this.removeColumn()
    this.reorderSubHeader()
  }

  reorderSubHeader() {
    this.tableProp.header.map(value => value.subHeader).flat().forEach((value, index) => {
      value.order = index
    })
  }

  getNormalizeText(headerObject: Header | SubHeader): string {
    let titleStr = (('column' in headerObject) ?
      this.tableProp.header.map(value => value.subHeader).flat().find(value => value.order === headerObject.order).title :
      this.tableProp.header.find(value => value.order === headerObject.order).title)
      .replaceAll("\n", "<br>")

    return titleStr
  }

  SaveAndClose() {
    this.currentTableComponent.tableProp = this.tableProp
    this.dialogRef.close()
  }

  closeDialog() {
    this.dialogRef.close(-1)
  }
}
