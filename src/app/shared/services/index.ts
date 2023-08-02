import { UtilsService } from './utils.service';
import { BluetoothService } from './bluetooth.service';

export const services: any[] = [
    UtilsService,
    BluetoothService,
];

export * from './utils.service';
export * from './bluetooth.service';
