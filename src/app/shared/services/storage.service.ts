import {Injectable} from "@angular/core";
import {Capacitor} from "@capacitor/core";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {
  }

  getStoredState() {
    let savedState;
    if (Capacitor.isNativePlatform()) {
      setTimeout(async () => {
        const storage: any = environment.db;
        savedState = JSON.parse((await storage.get('state')) as string);
      });
    } else {
       savedState = JSON.parse(localStorage.getItem('state') as string);
    }
    return savedState;
  }
}
