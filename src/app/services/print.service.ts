import {Injectable} from '@angular/core';
import jsPDF from "jspdf";
import {myFont, myFont_bold, myFont_italic} from "../../assets/fonts/Open_sans";
import autoTable from "jspdf-autotable";

const pdfConfig = {
  fontSize: 12,
  subLineHeight: 4,
  leftBorder: 10,
  rightBorder: 10,
  redLineBorder: 15,
  topBorder: 15,
  bottomBorder: 15,
};

export type PDFObjectType = "text" | "table" | "space" | "line" | "image"

export interface PDFDocObject {
  type?: Partial<PDFObjectType>
  fontSize?: Partial<number>
  fontColor?: Partial<string>
  fontStyle?: "normal" | "bold" | "italic" | undefined
  align?: Partial<"left" | "center" | "right" | "justify">
  subLineHeight?: number,
  redLine?: boolean,
  repeatLine?: number
  value?: any
}

export interface PDFImageObject extends PDFDocObject {
  left?: number
  top?: number
  height: number
  width: number
  src: string
  imageType: string
}

const defaultColor = "#000000";
const colorGray = "#4d4e53";
const pdfDoc = new jsPDF()


@Injectable({
  providedIn: 'root'
})
export class PrintService {
  currentHeight: number = 0;
  docWidth = pdfDoc.internal.pageSize.width;
  docHeight = pdfDoc.internal.pageSize.height;
  docWorkWidth = this.docWidth - pdfConfig.leftBorder - pdfConfig.rightBorder


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
  }

  private resetCurrentHeight() {
    this.currentHeight = pdfConfig.topBorder
  }

  createPDF(docData: PDFDocObject[]) {
    console.log(docData)
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
        case "image":
          this.addImage(docObject as PDFImageObject)
          break
      }
    })

    pdfDoc.output('dataurlnewwindow')
    //doc.save("анкетка,pdf")
  }

  private addText(docObject: PDFDocObject) {
    if(!docObject.value) return

    pdfDoc.setFontSize(docObject.fontSize ? docObject.fontSize : pdfConfig.fontSize)
    pdfDoc.setTextColor(docObject.fontColor ? docObject.fontColor : defaultColor)
    switch (docObject.fontStyle){
      case "bold": pdfDoc.setFont("MyFont_bold", "bold")
        break;
      case "italic": pdfDoc.setFont("MyFont_italic", "italic")
        break;
      default: pdfDoc.setFont("MyFont", "normal")

    }


    let x = pdfConfig.leftBorder
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

    let text = docObject.value as string
    let charArr: string[] = [...text]
    let resultArray: string[] = []
    let tempStr = ""
    let deltaStr = ""
    let lastBlankString = ""
    charArr.forEach(c => {
      tempStr += c
      deltaStr += c

      if (c === " ") {
        lastBlankString = tempStr
        deltaStr = ""
      }

      if (pdfDoc.getTextWidth(tempStr) > this.docWorkWidth) {
        resultArray.push(lastBlankString)
        tempStr = deltaStr
        deltaStr = ""
      }

    })
    if (tempStr.length > 0)
      resultArray.push(tempStr)


    let firstLine = docObject.redLine
    resultArray.forEach(line => {
      this.addSpace(docObject)

      if (this.currentHeight > this.docHeight - pdfConfig.bottomBorder) {
        this.resetCurrentHeight()
        pdfDoc.addPage()
      }

      pdfDoc.text(line, firstLine ? pdfConfig.redLineBorder : x, this.currentHeight, {align: docObject.align});
      firstLine = false
    })
  }

  private addTable(docObject: PDFDocObject) {

    autoTable(pdfDoc, {
      head: docObject.value.head,
      body: docObject.value.body,
      rowPageBreak: "auto",
      styles: {
        font: "MyFont"
      },
      startY: this.currentHeight,
      didDrawPage: data => {
        console.log(data.cursor?.y)
        this.currentHeight = data.cursor?.y!!
      }
    })

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
}
