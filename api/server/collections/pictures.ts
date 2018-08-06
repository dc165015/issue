import { MongoObservable } from 'meteor-rxjs';
import { UploadFS } from 'meteor/jalik:ufs';
import * as sharp from 'sharp';
import { DEFAULT_PICTURE_URL } from '../lib/constants';
import { Picture } from '../models/picture';
import { isString } from 'lodash';
import { Users } from '../collections/users';
import { makeCollection } from '../lib/make-collections';

export interface PicturesCollection<T> extends MongoObservable.Collection<T> {
  getPictureUrl(selector?: Object | string): string;
}

export const Pictures = makeCollection<Picture>('pictures') as PicturesCollection<Picture>;

//TODO: add retrieve douban book images into db: https://github.com/jalik/jalik-ufs/#importing-file-from-a-url-server @v2

export const PicturesStore = new UploadFS.store.GridFS({
  collection: Pictures.collection,
  name: 'pictures',
  filter: new UploadFS.Filter({
    contentTypes: ['image/*'],
  }),
  transformWrite(from, to) {
    // TODO: adjust ratio according to pic's for attribute. make it small if it's avatar.
    // Resize picture, then crop it to 1:1 aspect ratio, then compress it to 75% from its original quality
    const transform = sharp().resize(300, 300).min().crop().toFormat('jpeg', { quality: 75 });
    from.pipe(transform).pipe(to);
  },

  permissions: new UploadFS.StorePermissions({
    insert: checkPermission,
    update: checkPermission,
    remove: checkPermission
  }),

  onFinishUpload(file) {
      console.log(file.name + ' 已上传');
  },
  onCopyError(err, fileId, file) {
      console.error('复制出错：' + file.name);
  },
  onReadError(err, fileId, file) {
      console.error('读取出错：' + file.name);
  },
  onWriteError(err, fileId, file) {
      console.error('写入出错：' + file.name);
  }
});

// Gets picture's url by a given selector
Pictures.getPictureUrl = function (selector) {
  const picture = (selector ? this.findOne(selector) : undefined) || {};
  return picture.url || DEFAULT_PICTURE_URL;
};

function checkPermission(userId, doc) {
  return userId == doc.userId && checkPicFields(doc) || Meteor.isDevelopment;
}

function checkPicFields(doc) {
  if (doc.bookId && !isString(doc.bookId)) return false;
  if (doc.copyId && !isString(doc.copyId)) return false;
  if (doc.for && !isString(doc.for)) return false;
  return true;
}

Pictures.collection.after.insert(
  function (userId, doc) {
    if (doc.for == Picture.FOR.USER_AVATAR) {
      const user = Users.collection.findOne(userId);
      if (!user || !user.profile) return;
      const oldPictureId = user.profile.pictureId;
      Pictures.collection.remove({ _id: oldPictureId });
    }
  }
);
