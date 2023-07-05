import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'docStatus'
})
export class DocStatusPipe implements PipeTransform {

  transform(value: string): string {
    let retStr: string = "Не известный статус"
    switch (value) {
      case "DRAFT": retStr = "Черновик"
        break;
      case "PREPARED": retStr = "Подготовлен к отправке"
        break;
      case "SENDING": retStr = "Отправлен в банк"
        break;
      case "PROCESSING": retStr = "На рассмотрении"
        break;
      case "INCORRECT": retStr = "Требует корректировки"
        break;
      case "ACCEPTED": retStr = "Принят "
        break;
      case "REJECTED": retStr = "Отвергнут"
        break;
    }
    return retStr;
  }

}
