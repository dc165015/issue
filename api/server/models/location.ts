import { clampString } from "../lib/util";

export class Location {
  static EQUATOR = 40075004;
  static DEFAULT_LAT = 51.678418;
  static DEFAULT_LNG = 7.809007;
  static DEFAULT_ZOOM = 8;
  static DEFAULT_ACCURACY = -1;

  static fromString(str) {
    clampString(str, 5);
    const [lat, lng, zoom = 0] = str.split(',').map(Number);
    return new Location(lat, lng, zoom);
  }

  constructor(public lat: number, public lng: number, public zoom: number = Location.DEFAULT_ZOOM, public accuracy: number = Location.DEFAULT_ACCURACY) {
    zoom = Math.min(zoom, 19);
    accuracy = accuracy;
  }

  toString(): string {
    return `${this.lat}, ${this.lng}, ${this.zoom}`;
  }

  isValid(): boolean {
    return !!this.lat && !!this.lng;
  }

  fromCoords(coords, deviceHeight: number, deviceWidth: number) {
    if (this.isValid()) {
      // Update view-models to represent the current geo-location
      this.accuracy = coords.accuracy;
      this.lat = coords.latitude;
      this.lng = coords.longitude;
      this.zoom = this.calculateZoomByAccureacy(this.accuracy, deviceHeight, deviceWidth);
    }
  }

  calculateZoomByAccureacy(accuracy: number, deviceHeight: number, deviceWidth: number): number {
    // Source: http://stackoverflow.com/a/25143326
    const screenSize = Math.min(deviceWidth, deviceHeight);
    const requiredMpp = accuracy / screenSize;

    return ((Math.log(Location.EQUATOR / (256 * requiredMpp))) / Math.log(2)) + 1;
  }
}
