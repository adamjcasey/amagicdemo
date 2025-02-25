import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccordionComponent, HeroComponent } from '@app/shared/components';
import * as fromCoreStore from '@core/store';
import { IonContent, IonToggle } from '@ionic/angular/standalone';
import * as fromStore from '@settings/store';

@Component({
  selector: 'automagic-manage-refill-delivery',
  templateUrl: 'manage-refill-delivery.page.html',
  styleUrls: ['manage-refill-delivery.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeroComponent,
    AccordionComponent,
    IonContent,
    IonToggle,
  ],
})
export class ManageRefillDeliveryPage implements OnInit, OnDestroy {
  public settingsConfig$!: Observable<any>;
  public settingsConfig: any;
  private _ngUnsubscribe: Subject<void> = new Subject<void>();
  public heroConfig: any;
  public myPharmacy: any;
  public myPharmacist: any;

  constructor(private _store: Store<fromCoreStore.CoreState>) {
    this.settingsConfig$ = this._store.select(fromStore.getSettingsConfig);
    this.heroConfig = {
      color: '--color-bg-pastel-green',
      template:
        '<h1 class="font-heading-1--bold">Manage Refill & Delivery</h1>',
    };

    this.myPharmacy = {
      type: 'contact',
      asset: '/assets/images/manage-refill-delivery-pharmacy.svg',
      title: 'Portola',
      position: 'Account connected',
      website: '#',
      phone: '#',
    };

    this.myPharmacist = {
      type: 'contact',
      asset: '/assets/images/care-team-avatar-2.svg',
      title: 'Dr. Mindy Jaa',
      position: 'My Pharmacist',
      email: '#',
      video: '#',
      phone: '#',
    };
  }

  ngOnInit() {
    this.settingsConfig$
      .pipe(takeUntil(this._ngUnsubscribe))
      .subscribe((settingsConfig) => {
        if (settingsConfig) {
          this.settingsConfig = settingsConfig;
        }
      });
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  saveAutomaticRefills(event: any) {
    this._store.dispatch(
      new fromStore.SetData({
        automaticRefiils: event.detail.checked,
      })
    );
  }
}
