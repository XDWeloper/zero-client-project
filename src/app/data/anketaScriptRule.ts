import {PDFDocObject} from "../services/print.service";
import {ComponentMaket, IceDocument} from "../interfaces/interfaces";
import {IceComponentType} from "../constants";


export class AnketaScriptRule {

  constructor(private document: IceDocument) {
  }

  getPrintRules(): PDFDocObject[] {
    let resRul = [...constRule]
    let componentListId: number[] = [25,184,27,5,7,185, 17,22,70,214, 30,32,34,195,38,40,42,44] /**Это ИД элементов котрые нужно отобразить на печать*/

    componentListId.forEach(id => {
      let comp = this.getComponentFromDoc(id)

      console.log("id:" + id)
      console.log("comp:")
      console.log(comp)

      if (comp) {
        if (comp.componentType === IceComponentType.AREA ||
            comp.componentType === IceComponentType.SELECT ||
            comp.componentType === IceComponentType.PLACE ||
              (comp.componentType === IceComponentType.INPUT
                && comp.inputType != "checkbox"
                && comp.inputType != "radio")) {
          resRul.push(...this.setPdfRuleForAreaInputComponent(comp))
        }
        if (comp.componentType === IceComponentType.INPUT && comp.inputType === "checkbox" && comp.visible)
          resRul.push(...this.setPdfRuleForCheckBoxComponent(comp))
        if (comp.componentType === IceComponentType.TEXT)
          resRul.push(...this.settPdfRuleForTextComponent(comp))

        }
    })


    return resRul as PDFDocObject[]
  }

  private settPdfRuleForTextComponent(comp: ComponentMaket): PDFDocObject[] {
    let string = ""
    switch (comp.componentID){
      case 90 : string = "Сведения о присутствии или отсутствии по указанному в п. 6 адресу фактического местонахождения организации (в т.ч. и при совпадении его с адресом юридического лица), его постоянно действующих органов управления, иного органа или лица, которые имеют право действовать от имени организации без доверенности"
    }

    return [{
      redLine: true,
      fontSize: 11,
      value: string + ":",
      fontStyle: "bold",
    }];
  }

  private setPdfRuleForCheckBoxComponent(comp: ComponentMaket): PDFDocObject[] {
    console.log(comp)
    return [{
      value: comp.value ? "Да" : "Нет"
    }];
  }

  setPdfRule(label: string, value: string): PDFDocObject[]{
    return [{
      redLine: true,
      fontSize: 11,
      value: label,
      fontStyle: "bold",
    },
      {
        type: "space",
        subLineHeight: 2
      },
      {
        value: value
      },
      {
        type: "space"
      }]
  }

  setPdfRuleForAreaInputComponent(comp: ComponentMaket): PDFDocObject[]{
    let valueString =  "Не указано."
    if(comp.componentType === IceComponentType.PLACE)
      valueString = (comp.value && comp.value.placeString) ? comp.value.placeString : valueString
    else
      valueString = comp.value ? comp.value : valueString

    return this.setPdfRule((comp.placeHolder ? comp.placeHolder : "") + ":", valueString)
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
