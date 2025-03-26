import { MockScenario } from '../models/bluetooth-mock.models';
import { DeviceStateCode } from './bluetooth.constants';

export const MOCK_SCENARIO_IDS = {
  CASSETTE_JOURNEY_HAPPY_PATH: 'cassetteJourneyHappyPath',
};

export const mockScenarios: { [key: string]: MockScenario } = {
  [MOCK_SCENARIO_IDS.CASSETTE_JOURNEY_HAPPY_PATH]: {
    id: MOCK_SCENARIO_IDS.CASSETTE_JOURNEY_HAPPY_PATH,
    name: 'Cassette Journey Happy Path',
    description: 'Simulates successful cassette insertion and verification',
    steps: [
      {
        state: DeviceStateCode.InsertCassette,
        duration: 3000,
      },
      {
        state: DeviceStateCode.PreparingCassette,
        duration: 3000,
      },
      {
        state: DeviceStateCode.ReadyForInjection,
        duration: 0,
      },
    ],
  },
};
