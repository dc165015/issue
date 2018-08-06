import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { Factory } from "meteor/dburles:factory";
import { Users } from "../collections/users";
import { importPictureFromUrl } from "./util";
import { isArray } from "lodash";
import { faker } from "meteor/practicalmeteor:faker";
import { User } from "../models/user";
import { MAX_MYNAME_LENGTH, MAX_MYDESCRIPTION_LENGTH } from "../lib/constants";

export function getUser(): User {
  return getRandomExistedUser() || Factory.create("user");
}

let userCount;

export function getUserCount() {
  return userCount = userCount || Users.collection.find().count();
}

export function getRandomExistedUser(): User{
  const count = Math.floor(Math.random() * getUserCount());
  return Meteor.users.findOne({}, { skip: count }) as User;
}

export function sampleUsers(size: number = 1): User[] {
  const N = Users.collection.find().count()-size;
  const random = Math.floor(Math.random() * N);
  let users = Users.collection.find({}, { limit: size, skip: random }).fetch();
  if (!isArray(users) || users.length != size) {
    throw Error(`Couldn't find enough sample users.`);
  }
  return users;
}

export function getUsers(limit = 2): User[] {
  const users = [];
  const existingUsers = Meteor.users.find({}, { limit }).fetch();
  for (let i = 0; i < limit; i += 1) {
    const user = existingUsers[i] || Factory.create("user");
    users.push(user);
  }
  return users;
}

const randomUser = {
  phone() {
    return {
      number: faker.phone.phoneNumber('+8613#########'),
      verified: Math.random() >= 0.5,
    }
  },

  profile() {
    const picture = importPictureFromUrl();
    return {
      name: faker.name.findName().substr(0, MAX_MYNAME_LENGTH),
      description: faker.lorem.paragraphs(3).substr(0, MAX_MYDESCRIPTION_LENGTH),
      pictureId: picture._id,
    };
  },

  services() {
    return {
      password: { bcrypt: Random.id(17) },
      resume: { loginTokens: [{ when: faker.date.past() }] }
    }
  },

  createdAt: ()=>faker.date.past(),
};

Factory.define('user', Users.collection, randomUser);
