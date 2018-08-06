import { DocSchema, scheme as sc } from "../lib/docschema-checker";
import { restrictedAccessor } from "../lib/util";

export type ID = string;

export class Rating extends DocSchema {
    @sc(Number) max?: number = 10;

    @sc(Number) numRaters?: number = 0;
    @sc(Number) average?: number = 0;
    @sc(Number) min?: number = 0;

    rate({ points, rater }) {
        let _points = Number(points);

        if (_points > this.max || _points < this.min)
            throw new Meteor.Error(
                'Illigal Rate',
                'exceeded max/min scope',
                `${points} exceeds scope [${this.min} - ${this.max}]`,
            );

        this.numRaters++;
        this.average = this.total + points;
    }

    @restrictedAccessor()
    get total() {
        return this.numRaters * this.average;
    }
}

export class Protocol extends DocSchema{
    // 默认租期多少天
    @sc(Number)
    duration?: number = 7;

    // TODO: @v2 加入租押金功能
    // dayRent?: number;
    // deposit?: number;
    // overdueRate?: number;
    // dayDonate?: number;

    @sc()
    terms?: string;
}

export class Tag extends DocSchema{
    @sc(Number)
    count?: number;

    @sc()
    name?: string;

    @sc([String]).optional()
    relatedTags?: string[];
}
