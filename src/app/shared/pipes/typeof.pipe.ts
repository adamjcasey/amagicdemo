import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'typeof',
  standalone: true,
})
export class TypeOfPipe implements PipeTransform {
  transform(value: any) {
    return typeof value;
  }
}
