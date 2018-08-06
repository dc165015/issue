import { Component, OnInit, OnDestroy } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { Subscription } from 'rxjs';
import { LocationProvider } from 'providers/location/location';

@Component({
  selector: 'location-message',
  templateUrl: 'location-message.html',
})
export class LocationMessageComponent implements OnInit, OnDestroy {
  intervalObs: Subscription;

  constructor(public viewCtrl: ViewController, public locationProvider: LocationProvider) {}

  ngOnInit() {
    this.locationProvider.startRefresh();
  }

  ngOnDestroy() {
    this.locationProvider.stopRefresh();
  }

  sendLocation() {
    this.viewCtrl.dismiss(this.locationProvider.location);
  }
}
