import {Injectable} from '@angular/core';
import jsPDF from "jspdf";
import {myFont, myFont_bold, myFont_italic, myFont_semiBold} from "../../assets/fonts/Open_sans";
import autoTable from "jspdf-autotable";

const pdfConfig = {
  fontSize: 14,
  subLineHeight: 5,
  leftBorder: 10,
  rightBorder: 10,
  redLineBorder: 15,
  topBorder: 15,
  bottomBorder: 15,
  checkBoxHeight: 5,
  checkBoxWidth: 5,
  tableHeaderFontSize: 8,
  tableHeaderFontStyle: "MyFont"

};

export type PDFObjectType = "text" | "table" | "space" | "line" | "image" | "checkBox"

export interface PDFDocObject {
  type?: Partial<PDFObjectType>
  fontSize?: Partial<number>
  fontColor?: Partial<string>
  fontStyle?: "normal" | "bold" | "italic" | "semiBold" | undefined
  align?: Partial<"left" | "center" | "right" | "justify">
  subLineHeight?: number,
  redLine?: boolean,
  repeatLine?: number
  value?: any,
  newLine?: boolean,
  left?: number,
  colNum?: number,
  tableCol?: number,
  frame?: boolean
}

export interface PDFImageObject extends PDFDocObject {
  left?: number
  top?: number
  height: number
  width: number
  src: string
  imageType: string
}

export interface PDFCheckBoxObject extends PDFDocObject {
  lineText: string
}

export interface PDFTableObject extends PDFDocObject {
  head?: string[]
  subHead?: string[]
  body?: any[]
}

const defaultColor = "#000000";
const colorGray = "#4d4e53";
const tableHeaderFillColor = colorGray
const pdfDoc = new jsPDF()



@Injectable({
  providedIn: 'root'
})
export class PrintService {
  currentHeight: number = 0;
  docWidth = pdfDoc.internal.pageSize.width;
  docHeight = pdfDoc.internal.pageSize.height;
  docWorkWidth = this.docWidth - pdfConfig.leftBorder - pdfConfig.rightBorder
  lastXPosition = 0
  lastYPosition = 0
  lastStringXPositionEnd = 0
  pageCount = 0
  stopCreateNewPage = false
  heightCorrect = pdfConfig.checkBoxHeight/4

  constructor() {
    this.addFont()
    this.resetCurrentHeight()
  }

  private addFont() {
    // добавить шрифт в jsPDF
    pdfDoc.addFileToVFS("MyFont.ttf", myFont);
    pdfDoc.addFont("MyFont.ttf", "MyFont", "normal");
    pdfDoc.addFileToVFS("MyFont_bold.ttf", myFont_bold);
    pdfDoc.addFont("MyFont_bold.ttf", "MyFont_bold", "bold");
    pdfDoc.addFileToVFS("MyFont_italic.ttf", myFont_italic);
    pdfDoc.addFont("MyFont_italic.ttf", "MyFont_italic", "italic");
    pdfDoc.addFileToVFS("MyFont_semiBold.ttf", myFont_semiBold);
    pdfDoc.addFont("MyFont_semiBold.ttf", "MyFont_semiBold", "normal");
  }

  private resetCurrentHeight() {
    this.currentHeight = pdfConfig.topBorder
  }

  private clearPdfDoc(){
    try {
      for(let i = this.pageCount + 1  ; i > 0; i--) {
        pdfDoc.deletePage(i)
      }
    } catch (e){
      console.log(e)
    }
  }

  createPDF(docData: PDFDocObject[]) {
    if(pdfDoc.getNumberOfPages() < 1) {
      pdfDoc.addPage()
      this.addFont()
      this.resetCurrentHeight()
    }

    docData.forEach(docObject => {
      let objectType = docObject.type ? docObject.type : "text"
      switch (objectType) {
        case "text":
          this.addText(docObject)
          break;
        case "table":
          this.addTable(docObject)
          break
        case "space":
          this.addSpace(docObject)
          break
        case "line":
          this.addLine(docObject)
          break
        case "checkBox":
          this.addCheckBox(docObject as PDFCheckBoxObject)
          break
        case "image":
          this.addImage(docObject as PDFImageObject)
          break
      }
    })

    pdfDoc.output('dataurlnewwindow')
    //doc.save("анкетка,pdf")
    this.clearPdfDoc()
  }

  private addText(docObject: PDFDocObject) {
    if(!docObject.value) return

    pdfDoc.setFontSize(docObject.fontSize ? docObject.fontSize : pdfConfig.fontSize)
    pdfDoc.setTextColor(docObject.fontColor ? docObject.fontColor : defaultColor)
    switch (docObject.fontStyle){
      case "bold": pdfDoc.setFont("MyFont_bold", "bold")
        break;
      case "semiBold": pdfDoc.setFont("MyFont_semiBold", "normal")
        break;
      case "italic": pdfDoc.setFont("MyFont_italic", "italic")
        break;
      default: pdfDoc.setFont("MyFont", "normal")

    }


    let x = docObject.left ? docObject.left : pdfConfig.leftBorder
    if (docObject.align) {
      switch (docObject.align) {
        case "center":
          x = this.docWidth / 2
          break
        case "right":
          x = this.docWidth - pdfConfig.rightBorder
          break
      }
    }
    let newLine =  docObject.newLine != undefined ? docObject.newLine : true
    let text = docObject.value as string
    let charArr: string[] = [...text]
    let resultArray: string[] = []
    let tempStr = ""
    let deltaStr = ""
    let lastBlankString = ""
    let deltaLastString = newLine ? 0 : this.lastStringXPositionEnd

    charArr.forEach(c => {
      tempStr += c
      deltaStr += c

      if(c === "\n"){
        resultArray.push(tempStr)
        tempStr = ""
      }

      if (c === " ") {
        lastBlankString = tempStr
        deltaStr = ""
      }

      if ((pdfDoc.getTextWidth(tempStr) + deltaLastString) > this.docWorkWidth) {
        resultArray.push(lastBlankString)
        tempStr = deltaStr
        deltaStr = ""
        deltaLastString = 0
      }

    })

    if(tempStr.length > 0) {
      resultArray.push(tempStr)
      this.lastStringXPositionEnd = pdfDoc.getTextWidth(tempStr)
    }

    let firstLine = docObject.redLine
    resultArray.forEach(line => {
      if(newLine)
        this.addSpace(docObject)
        this.checkNewPage()

      let xPosition = firstLine ? pdfConfig.redLineBorder : x
      let yPosition = this.currentHeight
      if(!newLine){
        xPosition = this.lastXPosition
        yPosition = this.lastYPosition
        newLine = true
      }


      pdfDoc.text(line,  xPosition  , yPosition,  {align: docObject.align});
      this.lastXPosition = xPosition + pdfDoc.getTextWidth(line)
      this.lastYPosition = this.currentHeight
      firstLine = false
    })
  }

  private drawRect(x: number,y: number, width: number, height: number){
    pdfDoc.rect(x,y,width,height)
  }

  private checkNewPage(){
    if (this.currentHeight > this.docHeight - pdfConfig.bottomBorder && !this.stopCreateNewPage) {
      this.resetCurrentHeight()
      pdfDoc.addPage()
      this.pageCount++
    }
  }

  private addTable(docObject: PDFDocObject) {

    this.createNestedTable(docObject)

    // autoTable(pdfDoc, {
    //   head: docObject.value.head,
    //   body: docObject.value.body,
    //   rowPageBreak: "auto",
    //   styles: {
    //     font: "MyFont"
    //   },
    //   startY: this.currentHeight,
    //   didDrawPage: data => {
    //     console.log(data.cursor?.y)
    //     this.currentHeight = data.cursor?.y!!
    //   }
    // })

  }

  private addSpace(docObject: PDFDocObject) {
    this.currentHeight += (docObject.subLineHeight ? docObject.subLineHeight : pdfConfig.subLineHeight) * (docObject.repeatLine ? docObject.repeatLine : 1)
  }

  private addLine(docObject: PDFDocObject) {
    if (docObject.fontColor)
      pdfDoc.setDrawColor(docObject.fontColor)
    pdfDoc.line(pdfConfig.leftBorder, this.currentHeight, this.docWidth - pdfConfig.rightBorder, this.currentHeight, "DF")
  }

  private addImage(docObject: PDFImageObject) {
    let imageHeader = new Image()
    imageHeader.src = docObject.src
    pdfDoc.addImage(
      imageHeader,
      docObject.imageType,
      docObject.left ? docObject.left : pdfConfig.leftBorder,
      docObject.top ? docObject.top : pdfConfig.topBorder,
      docObject.width,
      docObject.height
    )
  }

  private addCheckBox(docObject: PDFCheckBoxObject) {
    let x = pdfConfig.leftBorder
    if(docObject.tableCol && docObject.colNum){
      x += (this.docWorkWidth/docObject.tableCol) * (docObject.colNum - 1)
    }

    let left = docObject.redLine ? pdfConfig.redLineBorder  : x
    let src = docObject.value ? "assets/images/checked.webp" :  "assets/images/unchecked.png"
    let it =  docObject.value ? "webp" :  "png"

    if(docObject.newLine === false)
      this.currentHeight = this.lastYPosition - pdfConfig.subLineHeight + this.heightCorrect

    this.addImage({
      type: "image",
      top: this.currentHeight,
      left: left,
      height: pdfConfig.checkBoxHeight,
      width: pdfConfig.checkBoxWidth,
      src: src,
      imageType: it
    })
    this.currentHeight -= this.heightCorrect  /**Корректировка высоты*/

    this.addText({
      left: left + pdfConfig.checkBoxWidth * 2,
      value: docObject.lineText,
      fontSize: docObject.fontSize,
      fontStyle: docObject.fontStyle,
    })

    if(docObject.newLine === undefined || (docObject.newLine && docObject.newLine === true)
      || ((docObject.tableCol && docObject.colNum) && (docObject.tableCol === docObject.colNum))) {
      this.addSpace({})
    }
    this.checkNewPage()
  }

  private createNestedTable(docObject: PDFTableObject) {

   var nestedTableCell = {
      content: '',
    }

    let head = docObject.head
    let subHead = docObject.subHead
    let body = docObject.body
    let columnWidth = this.docWorkWidth / head.length
    let subHeaderColWidth = this.docWorkWidth/subHead.length


    let isTableCreated = false

    autoTable(pdfDoc,{
      headStyles: {valign: "middle", halign: "center",fillColor: tableHeaderFillColor,textColor: "#ffffff"},
      theme: "plain",
      head: [head],
      rowPageBreak: "auto",
      body: [[nestedTableCell]],
      startY: this.currentHeight,
      margin: {left: pdfConfig.leftBorder},
      tableWidth: this.docWorkWidth,
      styles:{font: pdfConfig.tableHeaderFontStyle,fontSize: pdfConfig.tableHeaderFontSize,cellWidth: columnWidth},
      didDrawCell: data => {
        if (data.row.index === 0 && data.row.section === 'body' && !isTableCreated) {
          isTableCreated = true
          autoTable(pdfDoc,{
            headStyles: {valign: "middle", halign: "center", fillColor: tableHeaderFillColor},
            showHead: 'firstPage',
            theme: "grid",
            head:[subHead],
            startY:data.cell.y,
            styles:{font: pdfConfig.tableHeaderFontStyle,fontSize: pdfConfig.tableHeaderFontSize,cellWidth: subHeaderColWidth},
            bodyStyles:{font: pdfConfig.tableHeaderFontStyle},
            margin: { left: data.cell.x },
            rowPageBreak: "auto",
            tableWidth: this.docWorkWidth,
            body: body,
            didDrawPage: data => {
              this.currentHeight = data.cursor?.y!!
            }
          })
        }
      },

    })
  }
}


















