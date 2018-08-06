import { DocSchema, scheme as sc } from '../lib/docschema-checker';
import { restrictedAccessor, isPrimitiveConstructor, isObjectConstructor } from '../lib/util';
import { isFunction, isArray } from 'lodash';

export abstract class DocModelStatic extends DocSchema {
    static collection?: Mongo.Collection<any>;
}

export class DocModel extends DocModelStatic {
    static get(id: string) {
        return this.collection.findOne(id);
    }

    @sc().optional() _id?: string;
    @sc(Date) createdAt?: Date | number; // so as to be compatible with Meteor's @types definition, e.g. Meteor.User.createdAt.
    @sc(Date) updatedAt?: Date | number;

    @restrictedAccessor()
    get _collection(): Mongo.Collection<any> {
        return (this.constructor as typeof DocModel).collection;
    }

    insert(callback?: Function) {
        this.createdAt = new Date();
        return this._collection.insert(this, callback);
    }

    remove(callback?: Function) {
        return this._collection.remove(this._id, callback);
    }

    update(
        modifier: Mongo.Modifier<DocModel>,
        options?: {
            multi?: boolean;
            upsert?: boolean;
        },
        callback?: Function,
    ) {
        this.updatedAt = new Date();
        return this._collection.update(this._id, modifier, options, callback);
    }

    upsert(
        modifier: Mongo.Modifier<DocModel>,
        options?: {
            multi?: boolean;
            upsert?: boolean;
        },
        callback?: Function,
    ) {
        return this._collection.upsert(this._id, modifier || { $set: this }, options, callback);
    }
}
