import { ID, } from "./share-models";
import { DocModel } from "./doc-model";
import { Location } from "./location";

export enum MessageType {
  TEXT = <any>'text',
  LOCATION = <any>'location',
  PICTURE = <any>'picture',
}

export class Message extends DocModel {
  _id?: ID;
  chatId?: ID;
  senderId?: ID;
  content?: string;
  createdAt?: Date;
  type?: MessageType;
  get isMine() {
    return this.senderId === Meteor.userId() ? 'mine' : 'other';
  }

  get location() {
    const [ lat, lng, zoom = 0 ] = this.content.split(',').map(Number);
    return <Location>{ lat, lng, zoom: Math.min(zoom, 19) };
  }
}
