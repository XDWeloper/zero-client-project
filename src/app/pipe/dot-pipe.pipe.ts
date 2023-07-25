import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dotPipe'
})
export class DotPipePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    if(value)
      return value + '.'
    return null;
  }

}
