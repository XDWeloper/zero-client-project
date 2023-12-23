import { Pipe, PipeTransform } from '@angular/core';
import {ComponentMaket} from "../interfaces/interfaces";
import {DataSourceMap} from "../services/data-source.service";

@Pipe({
  name: 'dataSourceFilter',
  standalone: true
})
export class DataSourceFilterPipe implements PipeTransform {

  transform(items: DataSourceMap[], searchText:string): DataSourceMap[] {
    console.log(searchText)
    if(!items || !searchText) return items

    searchText = searchText.toLocaleLowerCase()

    return items.filter(v => v.key.toLocaleLowerCase().includes(searchText)
      || v.value.toString().toLocaleLowerCase().includes(searchText)
      || (v.componentName && v.componentName.toLocaleLowerCase().includes(searchText)));
  }

}
