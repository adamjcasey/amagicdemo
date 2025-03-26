import { MockScenario } from '../models/bluetooth-mock.models';
import { DeviceStateCode } from './bluetooth.constants';

export const MOCK_SCENARIO_IDS = {
  CASSETTE_JOURNEY_HAPPY_PATH: 'cassetteJourneyHappyPath',
  CASSETTE_JOURNEY_USED_CASSETTE_PATH: 'cassetteJourneyUsedCassettePath',
  CASSETTE_REMOVE_HAPPY_PATH: 'cassetteRemoveHappyPath',
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
  [MOCK_SCENARIO_IDS.CASSETTE_JOURNEY_USED_CASSETTE_PATH]: {
    id: MOCK_SCENARIO_IDS.CASSETTE_JOURNEY_USED_CASSETTE_PATH,
    name: 'Cassette Journey Used Cassette Path',
    description: 'Simulates used cassette insertion and verification',
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
        state: DeviceStateCode.WarningCassetteUsed,
        duration: 200,
      },
      {
        state: DeviceStateCode.RemoveCassette,
        duration: 0,
      },
    ],
  },
  [MOCK_SCENARIO_IDS.CASSETTE_REMOVE_HAPPY_PATH]: {
    id: MOCK_SCENARIO_IDS.CASSETTE_REMOVE_HAPPY_PATH,
    name: 'Cassette Remove Happy Path',
    description: 'Simulates cassette removal and power off',
    steps: [
      {
        state: DeviceStateCode.RemoveCassette,
        duration: 5000,
      },
      {
        state: DeviceStateCode.PoweringOff,
        duration: 0,
      },
    ],
  },
};
