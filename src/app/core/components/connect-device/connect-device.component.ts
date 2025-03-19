import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {IonContent} from "@ionic/angular/standalone";
import {SliderPageComponent} from "@shared/components";
import * as fromSharedComponents from "@shared/components";
import * as fromSharedStore from "@shared/store";
import {Store} from "@ngrx/store";
import * as fromCoreStore from "@core/store";

@Component({
  selector: 'automagic-connect-device',
  templateUrl: './connect-device.component.html',
  styleUrls: ['./connect-device.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    SliderPageComponent
  ]
})

export class ConnectDeviceComponent  implements OnInit {
  @ViewChild('sliderPage', { static: false })
  sliderPage!: fromSharedComponents.SliderPageComponent;
  #store = inject(Store<fromCoreStore.CoreState>);

  slides: Array<any> = [
    {
      header: {
        color: '--color-bg-pastel-green-dark',
        asset: '/assets/images/welcome-step-2-2.svg',
      },
      content: {
        hide: false,
        hideNavigation: true,
        template: `
          <h1 class="font-heading-1--bold">Let's connect your Aria Autoinjector.</h1>
          <p>Power on the Aria Autoinjector.</p>
          <p>The light above the power button should blink to indicate the power is on and ready to pair.</p>
        `,
        actions: [
          {
            label: 'Connect Now',
            action: () => {
              // TODO: logic to connect the device
            },
          },
        ],
      },
    },
    {
      header: {
        color: '--color-bg-pastel-green-dark',
        asset: '/assets/images/welcome-step-2-3.svg',
      },
      content: {
        hide: false,
        hideNavigation: true,
        template: `
          <h1 class="font-heading-1--bold">Connecting...</h1>
          <p>Searching for Aria Autoinjectors...</p>
          <p>Ensure that your Aria is powered on and in range while pairing.</p>
          <div class="loader"></div>
        `,
        actions: [],
      },
    },
    {
      header: {
        color: '--color-bg-pastel-green-dark',
        asset: '/assets/images/welcome-step-2-4.svg',
      },
      content: {
        hide: false,
        hideNavigation: true,
        template: `
          <h1 class="font-heading-1--bold">Connected!</h1>
          <p>Your Aria Autoinjector is now connected to your phone.</p>
          <p>You're ready to proceed to the next step.</p>
        `,
        actions: [
          {
            label: 'Continue',
            action: () => {
              // TODO: logic to follow the steps after connection
              // this.#store.dispatch(
              //   new fromStore.SetData({
              //     bleAllowed: true,
              //     bleConnected: true,
              //   })
              // );
              // this.#store.dispatch(
              //   new fromSharedStore.TopbarChangeColor(
              //     '--color-bg-pastel-honey-yellow'
              //   )
              // );
              this.sliderPage.slideNext();
            },
          },
        ],
      },
    }
  ]

  constructor() { }

  ngOnInit() {
    this.#store.dispatch(
      new fromSharedStore.TopbarChangeColor('--color-bg-pastel-green-dark')
    );
  }

}
