import {PDFDocObject} from "../services/print.service";
import {ComponentMaket, IceComponent, IceDocument} from "../interfaces/interfaces";


export class AnketaScriptRule {

  constructor(private document: IceDocument) {
  }

  getPrintRules(): PDFDocObject[] {
    let resRul = [...constRule]
    let componentListId: number[] = [25, 27, 5, 7, 185]

    componentListId.forEach(id => {
      let comp = this.getComponentFromDoc(id)
      if (comp) {
        resRul.push({
            value: comp.placeHolder + ":",
            fontStyle: "bold",
          },
          {
            type:"space",
            subLineHeight: 2
          },
          {
            value: comp.value ? comp.value : "Не указано."
          },
          {
          type:"space"
          })
      }
    })


    return resRul as PDFDocObject[]
  }

  getComponentFromDoc(id: number): ComponentMaket {
    let component = this.document.docStep.flatMap(c => c.componentMaket).find(f => f.componentID === id)
    return component
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
    fontStyle: "bold"
  }, {
    value: "127055, Российская Федерация, г.Москва, ул.Палиха, дом 10, стр.7",
    align: "center",
    fontSize: 8,
  }, {
    value: "Генеральная лицензия Банка России №3531 от 02 апреля 2018 года,",
    align: "center",
    fontSize: 8,
  }, {
    value: "ИНН 7750056670, ОГРН 1157700005759",
    align: "center",
    fontSize: 8,
  },
  {
    type: "space"
  },
  {
    type: "line"
  },
  {
    type: "space"
  },
  {
    value: "ОПРОСНЫЙ ЛИСТ",
    align: "center",
    fontStyle: "bold",
    fontSize: 18,
  },
  {
    type: "space"
  },
  {
    type: "line"
  },
  {
    type: "space"
  },
]
