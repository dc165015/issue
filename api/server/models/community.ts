import { ID } from './share-models';
import { DocModel } from './doc-model';
import { restrictedAccessor } from '../lib/util';
import { Users } from '../collections/users';
import { Copies } from '../collections/copies';
import { Books } from '../collections/books';
import { scheme as sc } from '../lib/docschema-checker';
import { MAX_MYDESCRIPTION_LENGTH, MAX_MYNAME_LENGTH } from '../lib/constants';

export enum CommunityType {
    NONE = 0,
    ALL = 1,
    ANY = 2,
    DEFAULT = 10,
    CLASS = 20,
    GRADE,
    SCHOOL,
    UNIVERSITY,
    DEPARTMENT = 30,
    COMPANY,
    RESIDENTIAL_QUARTER = 40,
    DISTRICT,
    CITY,
    FRIENDS = 50,
    TOPIC = 100,
}

export class Community extends DocModel {
    // 使用含有.的特殊的ID，以便未来可以使用 类似分级域名的方式 来分级社群。 比如：.GOOGLE.CN 表示谷歌中国社群;
    // ALL.* 表示全局公共社群, 所有用户都属于此群；
    static All = Object.assign(new Community('全部', CommunityType.ALL), { _id: 'all.*' });
    // NONE. 表示不在某群的用户群, 可以用于表示黑名单；
    // NONE.* 表示系统黑名单
    static None = Object.assign(new Community('外人', CommunityType.ALL), { _id: 'none.*' });
    // TOBE. 表示申请加入到某群的用户群，比如：TOBE.5hi348dh4kok8fhqad 表示 _id为5hi348dh4kok8fhqad 的群中在申请加入中的用户群
    // TOBE.* 表示未注册的访客
    static Tobe = Object.assign(new Community('申请人', CommunityType.ALL), { _id: 'tobe.*' });

    // TODO: @v1: @high 加入年级、学校
    @sc(Number) type: CommunityType;
    @sc(Boolean) isPublic: Boolean;
    @sc().max(MAX_MYNAME_LENGTH) name: string;
    @sc().max(MAX_MYDESCRIPTION_LENGTH) description?: string;
    @sc().optional() createdBy?: ID;
    @sc().optional() updatedBy?: ID;
    @sc().optional() parentId?: ID;
    @sc(Number) memberCount?: number = 0;
    @sc(Number) copyCount?: number = 0;

    // TODO: @v1: 加入新申请成员列表
    @sc([ String ]).optional() applicantIds?: ID[];

    // @sc()
    // state: string;

    // TODO: @v2: 加入成员间借阅订单数量
    // orderCount?: number = 0;

    constructor(name?: string, type: CommunityType = CommunityType.DEFAULT) {
        super();
        this.name = name;
        this.type = type;
    }

    @restrictedAccessor()
    get averageOwnCopyCount() {
        return this.copyCount / this.memberCount;
    }

    @restrictedAccessor()
    get members() {
        let selector = this.type == CommunityType.ALL ? {} : { communityIds: this._id };
        return Users.find(selector).fetch();
    }

    @restrictedAccessor()
    get copies() {
        return Copies.find({ ownerId: { $in: this.members.map((u) => u._id) } }).fetch();
    }

    @restrictedAccessor()
    get books() {
        return Books.find({ _id: { $in: this.copies.map((c) => c.bookId) } }).fetch();
    }
}
