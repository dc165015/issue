import { Rating } from './share-models';
import { Copies } from '../collections/copies';
import { Meteor } from 'meteor/meteor';
import { Orders } from '../collections/orders';
import { DocModel } from './doc-model';
import { Communities } from '../collections/communities';
import { DocSchema, scheme as sc } from '../lib/docschema-checker';
import { Copy } from './copy';
import { MIN_MYNAME_LENGTH, MAX_MYNAME_LENGTH, MAX_MYDESCRIPTION_LENGTH, MAX_MYTERMS_LENGTH } from '../lib/constants';
import { Pictures } from '../collections/pictures';
import { restrictedAccessor } from '../lib/util';
import { Community } from './community';

export class Profile extends DocSchema {
    @sc().range(MIN_MYNAME_LENGTH, MAX_MYNAME_LENGTH, `名称最短${MIN_MYNAME_LENGTH}字，最长${MAX_MYNAME_LENGTH}字`)
    name?: string;

    @sc().max(MAX_MYDESCRIPTION_LENGTH, `简介最长{MAX_MYDESCRIPTION_LENGTH}字`).optional() description?: string;
    @sc().optional() pictureId?: string;
    @sc(Number) ownedCopyCount: number = 0;
    @sc(Number) borrowedCount: number = 0;
    @sc(Rating) borrowedRating?: Rating = new Rating();
    @sc(Number) lentCount: number = 0;
    @sc(Rating) lentRating?: Rating = new Rating();
}

export class Phone extends DocSchema {
    @sc().regEx(/\+861\d{10}/, '请填写11位手机号，只允许填数字')
    number: string;
    @sc(Boolean) verified: boolean;
}

export class UserSettings extends DocSchema {
    @sc(Boolean) notifications: boolean = true;
    @sc().max(MAX_MYTERMS_LENGTH, `条款最长${MAX_MYDESCRIPTION_LENGTH}字`)
    myTerms?: string;
}

export class User extends DocModel {
    static me: User;
    static isMe: (id: string) => boolean;

    @sc(Profile) profile?: Profile = new Profile();
    @sc(Phone) phone?: Phone = new Phone();
    @sc([ String ]) communityIds?: string[] = [];
    @sc(Object) services?: object = {};
    @sc(UserSettings) settings?: UserSettings = new UserSettings();

    @restrictedAccessor()
    get isMe(): boolean {
        return this._id == Meteor.userId();
    }

    @restrictedAccessor()
    get isProfiled(): boolean {
        return !!this.profile.name;
    }

    @restrictedAccessor()
    get picture() {
        return Pictures.getPictureUrl(this.profile.pictureId);
    }

    @restrictedAccessor()
    get rating() {
        return this.profile.borrowedRating || new Rating();
    }

    @restrictedAccessor()
    get nickname() {
        if (this.profile.name) return this.profile.name;
        if (!this.phone || !this.phone.number) return '无名';
        let name = this.phone.number.replace(/^\+86/, '');
        if (!this.isMe) name = name.replace(/^(?:\+86)?(\d)\d*(\d)$/, '$1*****$2');
        return name;
    }

    @restrictedAccessor()
    get copies() {
        return this.getCopies();
    }

    getCopies(selector?: Mongo.Selector<Copy>, options?: MongoFindOptions) {
        selector = Object.assign({}, selector, { ownerId: this._id });
        return Copies.find(selector, options).fetch();
    }

    @restrictedAccessor()
    get orders() {
        return this.getOrders();
    }

    getOrders(selector?: Mongo.Selector<Copy>, options?: MongoFindOptions) {
        selector = Object.assign({}, selector, { $or: [{ ownerId: this._id }, {borrowerId: this._id }] });
        return Orders.find(selector, options).fetch();
    }

    @restrictedAccessor()
    get lentOrders() {
        return this.getLentOrders();
    }

    getLentOrders(selector?: Mongo.Selector<Copy>, options?: MongoFindOptions) {
        selector = Object.assign({}, selector, { ownerId: this._id });
        return Orders.find(selector, options).fetch();
    }

    @restrictedAccessor()
    get borrowedOrders() {
        return this.getBorrowedOrders();
    }

    getBorrowedOrders(selector?: Mongo.Selector<Copy>, options?: MongoFindOptions) {
        selector = Object.assign({}, selector, { borrowerId: this._id });
        return Orders.find(selector, options).fetch();
    }

    @restrictedAccessor()
    get communities() {
        return Communities.find({ _id: { $in: this.communityIds } }).fetch();
    }

    @restrictedAccessor()
    get community() {
        return Communities.findOne(this.communityIds[0]) || Community.All;
    }

    @restrictedAccessor()
    get communityId() {
        return this.communityIds[0];
    }
}

Object.defineProperty(User, 'me', {
    get(): User {
        return Meteor.user() as User;
    },
});

User.isMe = (id: string) => {
    return id && Meteor.userId() == id;
};
