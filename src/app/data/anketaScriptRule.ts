import {PDFDocObject, PDFTableObject} from "../services/print.service";
import {ComponentMaket, IceDocument} from "../interfaces/interfaces";
import {IceComponentType} from "../constants";
import {stripHtml} from "string-strip-html";

interface ComponentRuleForPDF {
  id: number
  tabCount?: number
  addDash?: boolean
  newLine?: boolean
  colNum?: number
  tableCol?: number
  redLine?: boolean
  frame?: boolean
  fontSize?: number
  fontStyle?: "normal" | "bold" | "italic" | "semiBold" | undefined
}

const oneTab = 3 //пробелов у одного таба
const PAY_TABLE_ID = -111 // Таблица безналичных расчетов(делаем в ручную)

const componentListId: ComponentRuleForPDF[] = [
  /**1 страница*/
  {id: 25}, {id: 184, tabCount: 1}, {id: 27}, {id: 5}, {id: 7}, {id: 185},
  /**2 страница*/
  {id: 17}, {id: 11, redLine: true}, {id: 22}, {id: 21, redLine: true}, {id: 19, redLine: true}, {id: 70}, {
    id: 214,
    tabCount: 2
  },
  /**3 страница*/
  {id: 30}, {id: 32}, {id: 34}, {id: 195}, {id: 38, tabCount: 2, addDash: true},
  {id: 40, tabCount: 2, addDash: true}, {id: 42}, {id: 44},
  /**4 страница*/
  {id: 58}, {id: 60}, {id: 62}, {id: 64}, {id: 241}, {id: 73},
  /**5 страница*/
  {id: 254}, {id: 255},
  /**6 страница*/
  {id: 14}, {id: 250}, {id: 378}, {id: 379, redLine: true},
  {id: 24, redLine: true}, {id: 249, tabCount: 2}, {id: 28}, {id: 382},
  /**7 страница*/
  {id: 384}, {id: 33}, {id: 36, redLine: true}, {id: 392, redLine: true}, {id: 394, redLine: true},
  {id: 396, redLine: true}, {id: 398, redLine: true}, {id: 41, redLine: true}, {id: 387, redLine: true},
  {id: 50, tabCount: 2}, {id: 51}, {id: 54, redLine: true}, {id: 53, redLine: true}, {id: 59, tabCount: 2},
  /**8 страница*/
  {id: 119}, {id: 120, redLine: true},
  {id: 123, tableCol: 4, colNum: 1, redLine: false}, {id: 122, tableCol: 4, colNum: 2, redLine: false, newLine: false},
  {id: 121, tableCol: 4, colNum: 3, redLine: false, newLine: false}, {
    id: 127,
    tableCol: 4,
    colNum: 4,
    redLine: false,
    newLine: false
  },

  {id: 129, tableCol: 4, colNum: 1, redLine: false}, {id: 130, tableCol: 4, colNum: 2, redLine: false, newLine: false},
  {id: 131, tableCol: 4, colNum: 3, redLine: false, newLine: false}, {
    id: 132,
    tableCol: 4,
    colNum: 4,
    redLine: false,
    newLine: false
  },

  {id: 133, tableCol: 4, colNum: 1, redLine: false}, {id: 134, tableCol: 4, colNum: 2, redLine: false, newLine: false},
  {id: 135, tableCol: 4, colNum: 3, redLine: false, newLine: false}, {
    id: 136,
    tableCol: 4,
    colNum: 4,
    redLine: false,
    newLine: false
  },
  {id: 139, tabCount: 2}, {id: 383, redLine: true}, {id: 31, fontStyle: "italic", redLine: true},
  {id: PAY_TABLE_ID}, {id: 408},
  /**9 страница*/
  {id: 407}, {id: 359}, {id: 360}, {id: 412}, {id: 362, tableCol: 3, colNum: 2, newLine: false}, {
    id: 363,
    tableCol: 3,
    colNum: 3,
    newLine: false
  },
  /**10 страница*/
  {id: 416}, {id: 376}, {id: 377},
  /**11 страница*/
  {id: 77},
  /**12 страница*/
  {id: 178},

]

/**Это ИД элементов котрые нужно отобразить на печать*/

export class AnketaScriptRule {
  currentCrfPdf: ComponentRuleForPDF

  constructor(private document: IceDocument) {
  }

  getPrintRules(): PDFDocObject[] {
    let resRul = [...constRule]

    componentListId.forEach(crfpdf => {
      let comp = this.getComponentFromDoc(crfpdf.id)
      this.currentCrfPdf = crfpdf
      if (comp) {
        if (comp.componentType === IceComponentType.AREA ||
          comp.componentType === IceComponentType.SELECT ||
          comp.componentType === IceComponentType.PLACE ||
          (comp.componentType === IceComponentType.INPUT
            && comp.inputType != "checkbox"
            && comp.inputType != "radio")) {
          resRul.push(...this.setPdfRuleForAreaInputComponent(comp))
        }
        if (comp.componentType === IceComponentType.INPUT && comp.inputType === "checkbox")
          resRul.push(...this.setPdfRuleForCheckBoxComponent(comp))
        if (comp.componentType === IceComponentType.TEXT)
          resRul.push(...this.setPdfRuleForTextComponent(comp))
        if (comp.componentType === IceComponentType.TABLE)
          resRul.push(...this.setPdfRuleForTableComponent(comp))
        if (comp.componentType === IceComponentType.UPLOAD)
          resRul.push(...this.setPdfRuleForUploadComponent(comp))
      }
      if (crfpdf.id === PAY_TABLE_ID) {
        resRul.push(...this.createPayTableRule())
      }
    })

    return resRul as PDFDocObject[]
  }

  private setPdfRuleForTextComponent(comp: ComponentMaket): PDFDocObject[] {
    let string = stripHtml(comp.value ? comp.value : "").result
    return this.setPdfRule(string, "")
  }

  private setPdfRuleForCheckBoxComponent(comp: ComponentMaket): PDFDocObject[] {
    return [{
      type: "checkBox",
      value: comp.value ? comp.value : false,
      lineText: comp.placeHolder,
      redLine: this.currentCrfPdf.redLine,
      fontSize: 10,
      fontStyle: "normal",
      colNum: this.currentCrfPdf.colNum,
      tableCol: this.currentCrfPdf.tableCol,
      newLine: this.currentCrfPdf.newLine
    } as PDFDocObject]
  }

  setPdfRule(label: string, value: string): PDFDocObject[] {
    if (this.currentCrfPdf.addDash) {
      label = "- " + label
    }
    if (this.currentCrfPdf.tabCount) {
      let tabSpaceString = ""
      for (let i = 0; i < this.currentCrfPdf.tabCount * oneTab; i++) {
        tabSpaceString += " "
      }
      label = tabSpaceString + label
    }
    return [{
      redLine: this.currentCrfPdf.redLine,
      fontSize: 10,
      value: label,
      fontStyle: this.currentCrfPdf.fontStyle ? this.currentCrfPdf.fontStyle : "bold",
      frame: this.currentCrfPdf.frame,
    },
      {
        value: value,
        newLine: false,
        fontStyle: "italic",
      },
      {
        type: "space"
      }]
  }

  setPdfRuleForAreaInputComponent(comp: ComponentMaket): PDFDocObject[] {
    let valueString = "Не указано."
    if (comp.componentType === IceComponentType.PLACE)
      valueString = (comp.value && comp.value.placeString) ? comp.value.placeString : valueString
    else
      valueString = comp.value ? comp.value : valueString

    return this.setPdfRule((comp.placeHolder ? comp.placeHolder : "") + ": ", valueString)
  }

  getComponentFromDoc(id: number): ComponentMaket {
    let component = this.document.docStep.flatMap(c => c.componentMaket).find(f => f.componentID === id)
    return component
  }

  private createPayTableRule(): PDFTableObject[] {
    let header: string[] = [
      stripHtml(this.getComponentFromDoc(31).value).result,
      stripHtml(this.getComponentFromDoc(385).value).result,
      stripHtml(this.getComponentFromDoc(386).value).result
    ]
    let subHeader = [
      stripHtml(this.getComponentFromDoc(388).value).result, stripHtml(this.getComponentFromDoc(390).value).result,
      stripHtml(this.getComponentFromDoc(391).value).result, stripHtml(this.getComponentFromDoc(393).value).result,
      stripHtml(this.getComponentFromDoc(395).value).result, stripHtml(this.getComponentFromDoc(397).value).result
    ]
    let body = [[
      this.getComponentFromDoc(399).value, this.getComponentFromDoc(400).value,
      this.getComponentFromDoc(402).value, this.getComponentFromDoc(403).value,
      this.getComponentFromDoc(405).value, this.getComponentFromDoc(406).value
    ]]

    return [{
      type: "table",
      head: header,
      subHead: subHeader,
      body: body
    }, {
      type: "space"
    }]
  }

  private setPdfRuleForTableComponent(comp: ComponentMaket): PDFDocObject[] {
    if (!comp.value)
      return [];

    let header: string[]
    let subHeader: string[] = []
    let body: [][] = []
    let tableTitle = comp.tableType === 1 ? "Сведения об основных контрагентах, планируемых плательщиках и получателях денежных средств" : "Сведения об участниках общества, размерах их долей в уставном капитале и их оплате"

    if (comp.tableType === 1) {
      header = ["Плательщики", "Получатели"]
      subHeader = ["Наименование", "Местонахождение (страна, город)", "Наименование", "Местонахождение (страна, город)"]
    }

    if (comp.tableType === 2) {
      header = [
        "Сведения об участнике общества (Ф.И.О, дата и место рождения (организационно-правовая форма и наименование юридического лица)",
        "Вид, номер, серия, дата и место выдачи документа, удостоверяющего личность, орган, выдавший документ (номер гос. регистрации, наименование органа, осуществившего регистрацию, дата регистрации)",
        "Адрес места регистрации (место нахождения)",
        "Размер доли в уставном капитале общества",
        "Сведения об оплате доли"
      ]
      subHeader = ["1", "2", "3", "4", "5"]
    }

    (comp.value as [{}]).forEach(row => {
      let valArray: [] = Object.values(row) as []
      body.push(valArray)
    })

    return [
      {
        value: tableTitle,
        redLine: true,
        fontSize: 10,
        fontStyle: "italic"
      }, {
        type: "space"
      },
      {
        type: "table",
        head: header,
        subHead: subHeader,
        body: body
      } as PDFDocObject,
      {
        type: "space"
      }
    ]
  }

  private setPdfRuleForUploadComponent(comp: ComponentMaket): PDFDocObject[] {
    console.log(comp)
    let arr = comp.value as Array<{ name: string, size: number }>
    let header: string[] = ["Имя файла", "Размер"]
    let subHeader = [1, 2]
    let body: any[][] = []

    arr.forEach(f => {
      let tmp: any[] = [f.name, (f.size / 1024) + "Кб."]
      body.push(tmp)
    })

    return [
      {type: "space"},
      {
        value: "Файлы вложения:",
        redLine: true,
        fontSize: 10,
        fontStyle: "italic"
      },
      {type: "space"},
      {
        type: "table",
        head: header,
        subHead: subHeader,
        body: body
      } as PDFDocObject,
      {
        type: "space"
      }]
  }
}


const constRule = [
  {
    type: "image",
    height: 15,
    width: 15,
    src: "assets/images/cmr.webp",
    imageType: "webp"
  } as PDFDocObject,
  {
    value: "ЦМРБанк (общество с ограниченной ответственностью)",
    align: "center",
    fontSize: 10,
    fontStyle: "bold",
    subLineHeight: 4
  }, {
    value: "127055, Российская Федерация, г.Москва, ул.Палиха, дом 10, стр.7",
    align: "center",
    fontSize: 8,
    subLineHeight: 4
  }, {
    value: "Генеральная лицензия Банка России №3531 от 02 апреля 2018 года,",
    align: "center",
    fontSize: 8,
    subLineHeight: 4
  }, {
    value: "ИНН 7750056670, ОГРН 1157700005759",
    align: "center",
    fontSize: 8,
    subLineHeight: 4
  },
  {
    type: "space",
    subLineHeight: 4
  },
  {
    type: "line",
    subLineHeight: 4
  },
  {
    type: "space",
    subLineHeight: 4
  },
  {
    value: "ОПРОСНЫЙ ЛИСТ",
    align: "center",
    fontStyle: "bold",
    fontSize: 18,
    subLineHeight: 4
  },
  {
    type: "space",
    subLineHeight: 4
  },
  {
    type: "line",
    subLineHeight: 4
  },
  {
    type: "space",
    subLineHeight: 4
  },
]
