import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ellipsis',
  standalone: true,
})
export class EllipsisPipe implements PipeTransform {
  transform(
    value: string,
    maxLength: number = 20,
    showDots: boolean = true
  ): string {
    if (value.length > maxLength) {
      let trimmedValue = value.substring(0, maxLength);
      if (showDots) {
        trimmedValue += '...';
      }
      return trimmedValue;
    }
    return value;
  }
}
