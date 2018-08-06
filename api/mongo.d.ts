
declare module "mongo/collection" {
  function aggregate(...args): any;
};

declare type MongoFindOptions = {
  sort?: Mongo.SortSpecifier;
  skip?: number;
  limit?: number;
  fields?: Mongo.FieldSpecifier;
  reactive?: boolean;
  transform?: Function;
};

declare type BsonType = 1 | "double" |
2 | "string" |
3 | "object" |
4 | "array" |
5 | "binData" |
6 | "undefined" |
7 | "objectId" |
8 | "bool" |
9 | "date" |
10 | "null" |
11 | "regex" |
12 | "dbPointer" |
13 | "javascript" |
14 | "symbol" |
15 | "javascriptWithScope" |
16 | "int" |
17 | "timestamp" |
18 | "long" |
19 | "decimal" |
-1 | "minKey" |
127 | "maxKey" | "number"

declare type FieldExpression<T> = {
$eq?: T,
$gt?: T,
$gte?: T,
$lt?: T,
$lte?: T,
$in?: T[],
$nin?: T[],
$ne?: T,
$exists?: boolean,
$type?: BsonType[] | BsonType,
$not?: FieldExpression<T>,
$expr?: FieldExpression<T>,
$jsonSchema?: any,
$mod?: number[],
$regex?: RegExp | string,
$options?: string,
$text?: { $search: string, $language?: string, $caseSensitive?: boolean, $diacriticSensitive?: boolean },
$where?: string | Function,
$geoIntersects?: any,
$geoWithin?: any,
$near?: any,
$nearSphere?: any,
$all?: T[],
$elemMatch?: T extends {} ? Query<T> : FieldExpression<T>,
$size?: number,
$bitsAllClear?: any,
$bitsAllSet?: any,
$bitsAnyClear?: any,
$bitsAnySet?: any,
$comment?: string
}

declare type Flatten<T> = T extends any[] ? T[0] : T

declare type Query<T> = {
[P in keyof T]?: Flatten<T[P]> | RegExp | FieldExpression<Flatten<T[P]>>
} & {
    $or?: Query<T>[],
    $and?: Query<T>[],
    $nor?: Query<T>[]
} & Dictionary<any>

declare type QueryWithModifiers<T> = {
$query: Query<T>,
$comment?: string,
$explain?: any,
$hint?: any,
$maxScan?: any,
$max?: any,
$maxTimeMS?: any,
$min?: any,
$orderby?: any,
$returnKey?: any,
$showDiskLoc?: any,
$natural?: any
}

declare type Selector<T> = Query<T> | QueryWithModifiers<T>
