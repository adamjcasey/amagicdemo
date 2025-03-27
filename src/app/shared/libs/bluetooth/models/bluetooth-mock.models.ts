import { DeviceStateCode } from '../constants/bluetooth.constants';

export interface MockScenarioStep {
  state: DeviceStateCode;
  stateData?: number;
  duration: number;
}

export interface MockScenario {
  id: string;
  name: string;
  description: string;
  steps: MockScenarioStep[];
  loop?: boolean;
}
