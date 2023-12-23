import { Pipe, PipeTransform } from '@angular/core';
import {ComponentMaket} from "../interfaces/interfaces";

@Pipe({
  name: 'componentFilter',
  standalone: true
})
export class ComponentFilterPipe implements PipeTransform {

  transform(items: ComponentMaket[], searchText:string): ComponentMaket[] {
    if(!items || !searchText) return items

    searchText = searchText.toLocaleLowerCase()

    return items.filter(v => v.componentType.toLocaleLowerCase().includes(searchText)
      || v.componentID.toString().toLocaleLowerCase().includes(searchText)
      || v.componentName.toLocaleLowerCase().includes(searchText));
  }

}
