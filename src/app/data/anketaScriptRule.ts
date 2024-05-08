import {PDFDocObject} from "../services/print.service";
import {ComponentMaket, ComponentRuleForPDF} from "../interfaces/interfaces";
import {IceComponentType} from "../constants";
import {stripHtml} from "string-strip-html";

// const oneTab = 3 //пробелов у одного таба
// const PAY_TABLE_NAME = "pay_table" // Таблица безналичных расчетов(делаем в ручную)

export class AnketaScriptRule {
  currentCrfPdf: ComponentRuleForPDF
  private predIndex: number = 0;

  constructor(private documentComponent: ComponentMaket[]) {
  }

  getPrintRules(): PDFDocObject[] {
    let resRul = [...constRule]
    //let resRul: PDFDocObject[] = []

    this.documentComponent.filter(c => (c.printRule === undefined || (c.printRule && c.printRule.isPrint === true)))
      .forEach(comp => {
        this.currentCrfPdf = comp.printRule ? comp.printRule : {isPrint: comp.componentType != IceComponentType.TEXT}
        if (comp && this.currentCrfPdf.isPrint) {
          if (comp.componentType === IceComponentType.AREA || comp.componentType === IceComponentType.SELECT ||
            comp.componentType === IceComponentType.PLACE || (comp.componentType === IceComponentType.INPUT
              && comp.inputType != "checkbox" && comp.inputType != "radio")) {
            resRul.push(...this.setPdfRuleForAreaInputComponent(comp))
          }
          if (comp.componentType === IceComponentType.INPUT && comp.inputType === "checkbox")
            resRul.push(...this.setPdfRuleForCheckBoxComponent(comp))
          if (comp.componentType === IceComponentType.TEXT)
            resRul.push(...this.setPdfRuleForTextComponent(comp))
          if (comp.componentType === IceComponentType.TABLE) {
            resRul.push(...this.setPdfRuleForTableComponent(comp))
          }
          if (comp.componentType === IceComponentType.UPLOAD)
            resRul.push(...this.setPdfRuleForUploadComponent(comp))
        }
      })

    return resRul as PDFDocObject[]
  }

  private setPdfRuleForTextComponent(comp: ComponentMaket): PDFDocObject[] {
    let string = stripHtml(comp.value ? comp.value : "", {skipHtmlDecoding: true}).result
    string = string.replaceAll("&nbsp;", "\n")
    return this.setPdfRule(string, "")
  }

  private setPdfRuleForCheckBoxComponent(comp: ComponentMaket): PDFDocObject[] {
    return [{
      type: "checkBox",
      value: comp.value ? comp.value : false,
      lineText: comp.placeHolder,
      redLine: this.currentCrfPdf.redLine,
      fontSize: this.currentCrfPdf.fontSize ? this.currentCrfPdf.fontSize : 10,
      fontStyle: this.currentCrfPdf.fontStyle ? this.currentCrfPdf.fontStyle : "normal",
      colNum: this.currentCrfPdf.colNum,
      tableCol: this.currentCrfPdf.tableCol,
      newLine: this.currentCrfPdf.newLine,
      tabCount: this.currentCrfPdf.tabCount
    } as PDFDocObject]
  }

  setPdfRule(label: string, value: string): PDFDocObject[] {
    if (this.currentCrfPdf.addDash) {
      label = "- " + label
    }
    let result: PDFDocObject[] = []

    if (label.length > 0)
      result.push({
        value: label,
        redLine: this.currentCrfPdf.redLine,
        fontSize: this.currentCrfPdf.fontSize ? this.currentCrfPdf.fontSize : 10,
        fontStyle: this.currentCrfPdf.fontStyle ? this.currentCrfPdf.fontStyle : "bold",
        frame: this.currentCrfPdf.frame,
        colNum: this.currentCrfPdf.colNum,
        tableCol: this.currentCrfPdf.tableCol,
        newLine: this.currentCrfPdf.newLine,
        align: this.currentCrfPdf.align,
        tabCount: this.currentCrfPdf.tabCount
      })
    if (value.length > 0)
      result.push({
        value: value,
        redLine: this.currentCrfPdf.redLine,
        fontSize: this.currentCrfPdf.fontSize ? this.currentCrfPdf.fontSize : 10,
        fontStyle: this.currentCrfPdf.fontStyle ? this.currentCrfPdf.fontStyle : "italic",
        frame: this.currentCrfPdf.frame,
        colNum: this.currentCrfPdf.colNum,
        tableCol: this.currentCrfPdf.tableCol,
        newLine: label.length > 0 ? false : this.currentCrfPdf.newLine,
        align: this.currentCrfPdf.align,
        //tabCount: this.currentCrfPdf.tabCount
      })

    return [
      ...result,
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

    let isOnlyValue = (comp.printRule && comp.printRule.onlyValue && comp.printRule.onlyValue === true) ? true : false
    return this.setPdfRule((comp.placeHolder && isOnlyValue === false ? comp.placeHolder + ": " : ""), valueString)
  }

  getComponentFromDoc(id: number): ComponentMaket {
    let component = this.documentComponent.find(f => f.componentID === id)
    return component
  }

  private setPdfRuleForTableComponent(comp: ComponentMaket): PDFDocObject[] {
    if (!comp.value)
      return [];

    let header: string[]
    let subHeader: string[][] = []
    let body: string[][][] = []
    let tableTitle = comp.tableType === 1 ? "Сведения об основных контрагентах, планируемых плательщиках и получателях денежных средств" : "Сведения об участниках общества, размерах их долей в уставном капитале и их оплате"

    if (comp.tableType && comp.tableType === 1) {
      header = ["Плательщики", "Получатели"]
      subHeader = [["Наименование", "Местонахождение (страна, город)"], ["Наименование", "Местонахождение (страна, город)"]]
    }

    if (comp.tableType && comp.tableType === 2) {
      header = [
        "Сведения об участнике общества (Ф.И.О, дата и место рождения (организационно-правовая форма и наименование юридического лица)",
        "Вид, номер, серия, дата и место выдачи документа, удостоверяющего личность, орган, выдавший документ (номер гос. регистрации, наименование органа, осуществившего регистрацию, дата регистрации)",
        "Адрес места регистрации (место нахождения)",
        "Размер доли в уставном капитале общества",
        "Сведения об оплате доли"
      ]
      subHeader = [["1"], ["2"], ["3"], ["4"], ["5"]]
    }

    if (comp.tableType === undefined) {
      header = comp.tableProp.header.map(value => value.title)
      subHeader = comp.tableProp.header.map(value => value.subHeader.map(value1 => value1.title))

      subHeader.map(val => val.length).forEach(arrLenght => {
        let resArr: [][] = [];
        comp.value.forEach((val: any[]) => {
          let resultArr: [] | undefined = val.filter((value, index) => this.predIndex <= index && index < (arrLenght + this.predIndex)) as []
          if (resultArr)
            resArr.push(resultArr)
        })
        this.predIndex = arrLenght
        body.push(resArr)
      })

    } else {
      subHeader.map(val => val.length).forEach(arrLenght => {
        let resArr: [][] = [];
        (comp.value as [{}]).map(row => Object.values(row) as []).forEach(val => {
          let resultArr: [] | undefined = val.filter((value, index) => this.predIndex <= index && index < (arrLenght + this.predIndex)) as []
          if (resultArr)
            resArr.push(resultArr)
        })
        this.predIndex = arrLenght
        body.push(resArr)
      })
    }

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
    if (!comp.value) return []
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
