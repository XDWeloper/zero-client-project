import { Pipe, PipeTransform } from '@angular/core';
import {DocStatus} from "../interfaces/interfaces";

@Pipe({
  name: 'docStatus',
  standalone: true
})
export class DocStatusPipe implements PipeTransform {

  transform(value: string): string {
    return  Object.values(DocStatus)[Object.keys(DocStatus).findIndex(k => k === value)]
  }

}
