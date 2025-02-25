import { Directive, HostListener, Input } from '@angular/core';
import { environment } from '../../../environments/environment';

@Directive({
  selector: '[automagicThreeFingerTap]',
  standalone: true,
})
export class ThreeFingerTapDirective {
  private readonly countFingerTap: number = environment.production ? 3 : 1;
  private touchCount: number = 0;
  private startY: number | undefined;

  @Input('automagicThreeFingerTap') callback: (() => void) | undefined;

  @HostListener('touchstart', ['$event'])
  onTouchStart(e: TouchEvent): void {
    this.touchCount = e.touches.length;
    this.startY = e.touches[0].clientY;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(e: TouchEvent): void {
    const threshold: number = 50;
    const endY: number = e.changedTouches[0].clientY;

    if (
      this.touchCount === this.countFingerTap &&
      endY > (this.startY as number) &&
      Math.abs(endY - (this.startY as number)) > threshold
    ) {
      if (this.callback) {
        this.callback();
      }
    }
    this.touchCount = 0;
    this.startY = 0;
  }
}
