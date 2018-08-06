import { MongoObservable } from 'meteor-rxjs';
import { Meteor } from 'meteor/meteor';
import { Pictures } from './pictures';
import { User } from '../models/user';

export const Users = MongoObservable.fromExisting<User>(Meteor.users as any);

Users.collection.after.update(
  function (userId, doc, fieldNames, modifier, options) {
    if (!doc.profile) return;
    if (!this.previous.profile) return;
    if (doc.profile.pictureId == this.previous.profile.pictureId) return;
    Pictures.remove({ _id: this.previous.profile.pictureId });
  },
  { fetchPrevious: true },
);

Users.collection['_transform'] = doc => User.wrapDoc(doc);

// var find = Meteor.users.find;
// var findOne = Meteor.users.findOne;

// Meteor.users.find = function (selector, options) {
  //   selector = selector || {};
  //   options = options || {};
  //   return find.call(this, selector, Object.assign({transform: transform}, options));
  // };

  // Meteor.users.findOne = function (selector, options) {
    //   selector = selector || {};
    //   options = options || {};
    //   return findOne.call(this, selector, Object.assign({transform: transform}, options));
    // };


    // Meteor.users.before.find((docId: string, selector: any, options: any = {}) => {
    //   options.transform = options.transform || ((doc) => User.wrapDoc(doc));
    // });

    // Meteor.users.before.findOne((userId, seleteor, options: any = {}) => {
    //   options.transform = options.transform || ((doc) => User.wrapDoc(doc));
    // });
