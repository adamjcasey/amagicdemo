import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, take } from 'rxjs';
import { mockScenarios } from '../constants/bluetooth-mock.constants';
import { DeviceStateCode } from '../constants/bluetooth.constants';
import { MockScenario } from '../models/bluetooth-mock.models';
import * as fromBluetoothStore from '../store';
import { getIsConnected, getUseMockDevice } from '../store/bluetooth.reducer';
import { BluetoothMockDeviceProvider } from './bluetooth-mock-device-provider.service';

@Injectable({
  providedIn: 'root',
})
export class BluetoothMockManagerService {
  #mockDeviceProvider = inject(BluetoothMockDeviceProvider);
  #store = inject(Store);

  #activeScenario: MockScenario | null = null;
  #currentStepIndex = 0;
  #timeoutId: any = null;
  #isRunning = false;

  #useMockDevice$ = this.#store.select(getUseMockDevice);
  #isConnected$ = this.#store.select(getIsConnected);

  startScenario(scenarioId: string): void {
    const scenario: MockScenario = mockScenarios[scenarioId];
    if (!scenario) {
      console.error(`Scenario '${scenarioId}' not found`);
      return;
    }

    this.stopScenario();

    console.log(`Starting mock scenario: ${scenario.name}`);
    this.#activeScenario = scenario;
    this.#currentStepIndex = 0;
    this.#isRunning = true;

    // Ensure we have a mock device connected and mock device is enabled
    combineLatest([this.#useMockDevice$, this.#isConnected$])
      .pipe(take(1))
      .subscribe(([useMockDevice, isConnected]) => {
        if (useMockDevice) {
          if (isConnected) {
            this.runCurrentStep();
          } else {
            this.#mockDeviceProvider.provideMockDevice().then(() => {
              this.runCurrentStep();
            });
          }
        } else {
          console.error(
            'Cannot start mock scenario: Mock device is not enabled'
          );
        }
      });
  }

  stopScenario(): void {
    if (this.#timeoutId) {
      clearTimeout(this.#timeoutId);
      this.#timeoutId = null;
    }

    this.#activeScenario = null;
    this.#isRunning = false;
    console.log('Stopped mock scenario');
  }

  private runCurrentStep(): void {
    if (!this.#activeScenario || !this.#isRunning) {
      return;
    }

    const step = this.#activeScenario.steps[this.#currentStepIndex];
    console.log(
      `Mock scenario step ${this.#currentStepIndex + 1}/${
        this.#activeScenario.steps.length
      }: Setting state to ${DeviceStateCode[step.state]}`
    );

    this.#store.dispatch(
      new fromBluetoothStore.MockScenarioStepExecuted({
        stepIndex: this.#currentStepIndex,
        totalSteps: this.#activeScenario.steps.length,
        state: step.state,
      })
    );

    this.#store.dispatch(new fromBluetoothStore.UpdateDeviceState(step.state));

    if (step.stateData !== undefined) {
      this.#store.dispatch(
        new fromBluetoothStore.UpdateDeviceStateData(step.stateData)
      );
    }

    // Schedule the next step
    this.#timeoutId = setTimeout(() => {
      this.moveToNextStep();
    }, step.duration);
  }

  private moveToNextStep(): void {
    if (!this.#activeScenario || !this.#isRunning) {
      return;
    }

    this.#currentStepIndex++;

    // Check if we've reached the end of the steps
    if (this.#currentStepIndex >= this.#activeScenario.steps.length) {
      if (this.#activeScenario.loop) {
        console.log('Mock scenario looping back to start');
        this.#currentStepIndex = 0;
        this.runCurrentStep();
      } else {
        console.log('Mock scenario completed');
        this.stopScenario();
      }
    } else {
      this.runCurrentStep();
    }
  }

  createScenario(scenario: MockScenario): MockScenario {
    if (mockScenarios[scenario.id]) {
      console.warn(
        `Scenario with ID ${scenario.id} already exists and will be overwritten`
      );
    }

    mockScenarios[scenario.id] = scenario;
    return scenario;
  }

  getActiveScenario(): { scenario: MockScenario; currentStep: number } | null {
    if (!this.#activeScenario) {
      return null;
    }

    return {
      scenario: this.#activeScenario,
      currentStep: this.#currentStepIndex,
    };
  }

  isScenarioRunning(): boolean {
    return this.#isRunning && !!this.#activeScenario;
  }
}
