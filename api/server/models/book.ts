import { DocModel } from './doc-model';
import { Rating, Tag } from './share-models';
import { scheme as sc, DocSchema } from '../lib/docschema-checker';
import { restrictedAccessor } from '../lib/util';

class BookPhotos extends DocSchema {
    @sc().optional() small?: string;
    @sc().optional() large?: string;
    @sc().optional() medium?: string;
    @sc([String]).optional() photoIds?: string[];
}

export class Series extends DocSchema {
    @sc().optional() title?: string;
    @sc().optional() id?: string;
}

let statusNo = 0;
export enum BookStatus {
    NORMAL = 2 ** statusNo++,
    ERROR = 2 ** statusNo++,
    PHOBIDDEN_CN = 2 ** statusNo++,
}

export enum BookSource {
    OTHER = 'other',
    DOUBAN = 'douban',
    DANGDANG = 'dangdang',
    AMAZON = 'amazon',
}

const CONFUSED_TAGS = [ '想读，一定很精彩！', '好书，值得一读', '未分类' ];

export class Book extends DocModel {
    // 用于记录书种的状态：禁书，有误，
    @sc(Number) copyCount?: number = 0;
    @sc(Number) ownerCount?: number = 0;
    @sc(Number) status?: BookStatus = BookStatus.NORMAL;
    @sc().optional() source?: BookSource = BookSource.DOUBAN;

    @sc() title?: string;
    @sc().optional() id?: string; // the id from source.
    @sc().optional() isbn10?: string;
    @sc().optional() isbn13?: string;
    @sc().optional() origin_title?: string;
    @sc().optional() alt?: string;
    @sc().optional() alt_title?: string;
    @sc().optional() subtitle?: string;
    @sc().optional() image?: string;
    @sc().optional() publisher?: string;
    @sc().optional() binding?: string;
    @sc().optional() author_Intro?: string;
    @sc().optional() summary?: string;
    @sc().optional() catalog?: string;
    @sc().optional() url?: string;
    @sc().optional() ebook_url?: string;
    @sc().optional() ebook_price?: string;
    @sc(Number).optional() price?: number;
    @sc(Number).optional() pages?: number;
    @sc(Series).optional() series?: Series;
    @sc(Date).optional() pubdate?: Date;
    @sc([String]).optional() author?: string[];
    @sc([String]).optional() translator?: string[];
    @sc(BookPhotos).optional() images?: BookPhotos;
    @sc(Rating).optional() rating?: Rating = new Rating();
    @sc([ Tag ]).optional() tags?: Tag[];

    @restrictedAccessor()
    get photos(): string[] {
        return this.images.photoIds;
    };

    static fixTags(tags: Tag[]) {
        let tagsMap = new Map();

        tags.forEach((tag, index) => {
            // 过滤不规范标签
            if (CONFUSED_TAGS.indexOf(tag.name) != -1) {
                tags[index] = undefined;
                return;
            }

            // 去除标点符号, . ; ! / *，以及替换全角空格
            let str = (<string>tag.name)
                .replace(/;+|；+|　+|,+|，+|\!+|！+|。+|\/+|\*+/g, ' ')
                // 去除替换后出现的连续的空格
                .replace(/\s+/g, ' ');

            // 以空格为分隔符拆分
            str.split(' ').forEach((tagName) => {
                // 去除无内容的空标签
                if (!tagName) return;

                // 合并此标签的计数
                let count = tagsMap.get(tagName) || 0;
                tagsMap.set(tagName, tag.count + count);
            });
        });

        return Array.from(tagsMap).sort((a, b) => b[1] - a[1]).map((tag) => {
            return { name: tag[0], count: tag[1] };
        });
    }
}
