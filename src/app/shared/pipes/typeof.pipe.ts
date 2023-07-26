import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'typeof' })

export class TypeOfPipe implements PipeTransform {
  transform(value: any) {
    return typeof value;
  }
}
