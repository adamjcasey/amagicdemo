import { MockScenario } from '../models/bluetooth-mock.models';
import { DeviceStateCode } from './bluetooth.constants';

export const MOCK_SCENARIO_IDS = {
  CASSETTE_JOURNEY_HAPPY_PATH: 'cassetteJourneyHappyPath',
  CASSETTE_JOURNEY_USED_CASSETTE_PATH: 'cassetteJourneyUsedCassettePath',
  CASSETTE_REMOVE_HAPPY_PATH: 'cassetteRemoveHappyPath',
  START_INJECTION_HAPPY_PATH: 'startInjectionHappyPath',
  START_INJECTION_INCOMPLETE_PATH: 'startInjectionIncompletePath',
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
        state: DeviceStateCode.PoweringOff,
        duration: 10000,
      },
      // get poweringOn after successful scanning
      // {
      //   state: DeviceStateCode.PoweringOn,
      //   duration: 1000,
      // },
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
  [MOCK_SCENARIO_IDS.START_INJECTION_HAPPY_PATH]: {
    id: MOCK_SCENARIO_IDS.START_INJECTION_HAPPY_PATH,
    name: 'Start Injection Happy Path',
    description: 'Simulates successful start injection',
    steps: [
      {
        state: DeviceStateCode.ReadyForInjection,
        duration: 3000,
      },
      {
        state: DeviceStateCode.Injecting,
        duration: 5000,
        progressiveStateData: {
          start: 0, // Start from 00
          end: 255, // End at FF
          interval: 20, // Update every 20ms to complete in ~10 seconds
        },
      },
      {
        state: DeviceStateCode.DwellTime,
        duration: 2000,
      },
      {
        state: DeviceStateCode.LiftFromInjectionSite,
        duration: 2000,
      },
      {
        state: DeviceStateCode.ReleasingCassette,
        duration: 8000,
        progressiveStateData: {
          start: 0, // Start from 00
          end: 255, // End at FF
          interval: 20, // Update every 20ms
        },
      },
      {
        state: DeviceStateCode.RemoveCassette,
        duration: 3000,
      },
      {
        state: DeviceStateCode.PoweringOff,
        duration: 3000,
      },
    ],
  },
  [MOCK_SCENARIO_IDS.START_INJECTION_INCOMPLETE_PATH]: {
    id: MOCK_SCENARIO_IDS.START_INJECTION_INCOMPLETE_PATH,
    name: 'Start Injection Incomplete Path',
    description: 'Simulates an incomplete injection where user lifts off early',
    steps: [
      {
        state: DeviceStateCode.ReadyForInjection,
        duration: 3000,
      },
      {
        state: DeviceStateCode.Injecting,
        duration: 3000,
        progressiveStateData: {
          start: 0, // Start from 00
          end: 127, // Only go to about 50% (127/255)
          interval: 20, // Update every 20ms
        },
      },
      {
        state: DeviceStateCode.WarningInjectionIncomplete,
        duration: 2000,
      },
      {
        state: DeviceStateCode.ReleasingCassette,
        duration: 8000,
        progressiveStateData: {
          start: 0, // Start from 00
          end: 255, // End at FF
          interval: 20, // Update every 20ms
        },
      },
      {
        state: DeviceStateCode.RemoveCassette,
        duration: 3000,
      },
      {
        state: DeviceStateCode.PoweringOff,
        duration: 3000,
      },
    ],
  },
};
