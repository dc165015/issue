import { Platform } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';
import { Location } from 'api/models/location';
import { interval, Subscription } from 'rxjs';

const LOCATION_REFRESH_INTERVAL = 500;

@Injectable()
export class LocationProvider {
  location: Location;
  intervalObs: Subscription;

  constructor(private platform: Platform, private geolocation: Geolocation) {}

  startRefresh(intervalTime:number = LOCATION_REFRESH_INTERVAL) {
    if (!this.intervalObs) this.intervalObs = interval(intervalTime).subscribe(() => this.loadLocation);
  }

  loadLocation() {
    return this.geolocation.getCurrentPosition().then((position) => {
      this.location.fromCoords(position.coords, this.platform.height(), this.platform.width());
    });
  }

  stopRefresh() {
    if (this.intervalObs) this.intervalObs.unsubscribe();
  }
}
