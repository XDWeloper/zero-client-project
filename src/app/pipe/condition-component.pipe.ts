import { Pipe, PipeTransform } from '@angular/core';
import {ComponentMaket} from "../interfaces/interfaces";

@Pipe({
  name: 'conditionComponent',
  standalone: true
})
export class ConditionComponentPipe implements PipeTransform {

  transform(items: {comp: ComponentMaket, compProp: string}[], searchText:string):{comp: ComponentMaket, compProp: string}[] {
    if(!items || !searchText) return items

    searchText = searchText.toLocaleLowerCase()

    return items.filter(v =>
      v.comp.componentType.toLocaleLowerCase().includes(searchText)
      || v.comp.componentID.toString().toLocaleLowerCase().includes(searchText)
      || v.comp.componentName.toLocaleLowerCase().includes(searchText));  }

}
