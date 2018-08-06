import { Meteor } from "meteor/meteor";
import { Picture } from "../models/picture";

export function importPictureFromUrl(name?, url?) {
  url = url || randomAvatarUrl();
  return Meteor.call('ufsImportURL', url, { name, for:Picture.FOR.USER_AVATAR }, 'pictures');
}

export function randomAvatarUrl() {
  const random = Math.floor(Math.random() * 100);
  const lego = random < 10;
  const gender = lego ? 'lego' : (random > 5 ? 'men' : 'women');
  return `https://randomuser.me/api/portraits/${gender}/${random}.jpg`;
}
