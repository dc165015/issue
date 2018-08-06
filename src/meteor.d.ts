declare module "meteor/jalik:ufs";
declare module "meteor/dburles:factory";
declare module "meteor/practicalmeteor:faker";
declare module "meteor/xolvio:cleaner";
declare module "meteor/mdg:validated-method";
declare module "meteor/matb33:collection-hooks";

declare module "meteor/check" {
  module Match {
    function Error(msg: string): void;
  }
};

declare module "meteor/mongo" {
  export const MongoInternals: any;
}

// declare module "meteor/mongo" {
//   export const MongoInternals: any;
//   namespace Mongo {
//     interface Collection {
//       count: number;
//     }
//   }
// };

// declare module "meteor-rxjs" {
//   module MongoObservable {
//     interface Collection<T> {
//       count: number;
//     }
//   }
// };

interface DocModel{
  _collection;
  createdAt?: Date;
  insert;
  update;
  remove;
  upsert;
}

declare module "meteor/meteor" {
  namespace Meteor {
    var collections: Map<string, Mongo.Collection<T>>;

    export interface User extends DocModel{
      isMe?: boolean;
      isProfiled?: boolean;
      picture?: string;
      nickname?: string;
      communities?;
      community?: Community;
      communityId?: string;
      rating?: Rating;
      getCopies();
      getOrders();
      getLentOrders();
      getBorrowedOrders();
    }
  }
};


declare module "meteor/ddp" {
  module DDP {
    function onReconnect(callback: () => any): void;
  }
};
