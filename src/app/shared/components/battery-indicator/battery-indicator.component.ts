import { Component, Input, OnChanges } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'automagic-battery-indicator',
  templateUrl: 'battery-indicator.component.html',
  styleUrls: ['battery-indicator.component.scss'],
  imports: [
    PercentPipe,
    IonIcon
  ]
})
export class BatteryIndicatorComponent implements OnChanges {
  @Input() batteryLevel: number = 0;
  @Input() width: number = 79;
  @Input() height: number = 37;
  @Input() showPercentage: boolean = true;
  @Input() fillColor: string = 'white';
  @Input() outlineColor: string = 'white';
  @Input() textColor: string = 'white';
  @Input() lowThreshold: number = 20;
  @Input() mediumThreshold: number = 50;
  @Input() lowColor: string = '#FF0000';
  @Input() mediumColor: string = '#FFD700';
  @Input() highColor: string = '#00FF00';
  @Input() useColoredFill: boolean = false;

  ngOnChanges(): void {
    // Ensure batteryLevel is within 0-100 range
    this.batteryLevel = Math.max(0, Math.min(100, this.batteryLevel));

    // Update fill color based on level if useColoredFill is true
    if (this.useColoredFill) {
      this.updateFillColor();
    }
  }

  calculateFillWidth(): number {
    const totalWidth = 14.5;
    const fillableWidth = totalWidth;

    return (this.batteryLevel / 100) * fillableWidth;
  }

  private updateFillColor(): void {
    if (this.batteryLevel <= this.lowThreshold) {
      this.fillColor = this.lowColor;
    } else if (this.batteryLevel <= this.mediumThreshold) {
      this.fillColor = this.mediumColor;
    } else {
      this.fillColor = this.highColor;
    }
  }
}

