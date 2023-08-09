import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[dinamicInnerHtml]'
})
export class DynamicInnerHtmlDirective implements OnChanges {
  @Input('dinamicInnerHtml') newContent!: string;
  private previousContent: string;
  constructor(private el: ElementRef) {
    this.previousContent = this.el.nativeElement.innerHTML;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.newContent !== this.previousContent) {
      this.el.nativeElement.innerHTML = this.newContent;
      this.previousContent = this.newContent;
    }
  }
}
