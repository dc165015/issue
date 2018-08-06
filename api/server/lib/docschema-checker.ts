import { Match } from 'meteor/check';
import { isNil, isFunction, isArray, cloneDeep, isObject, isPlainObject } from 'lodash';
import {
    hasOwn,
    convertMapOrSetToString,
    restrictedProperty,
    isObjectConstructor,
    isPrimitiveConstructor,
} from './util';

type Checkers = Map<string, Checker>;

/**
* DocSchema 作为DocModel的基类，存储Doc的每个属性的类型、值边界等Schema信息，并提供校验方法。
*/
export class DocSchema {
    private static _schema;

    static get schema(): { config: { [key: string]: any }; checkers: Checkers } {
        if (!hasOwn(this, '_schema')) {
            const parent = Object.getPrototypeOf(this).schema;
            const clone = parent ? cloneDeep(parent) : void 0;
            const mine = { config: {}, checkers: new Map() };
            this._schema = clone ? Object.assign(mine, clone) : mine;
        }
        return this._schema;
    }

    static getConfigOfKey(key: string, ruleName?: string) {
        const config = this.schema.config[key];
        return ruleName ? config[ruleName] : config;
    }

    static validateProp(key: string, value) {
        return this.schema.checkers.get(key).on(value);
    }

    // remove keys no registered in schema.
    static clean(doc: object) {
        for (let key in doc) {
            if (key != 'constructor' && !this.schema.checkers.get(key)) delete doc[key];
        }
        return doc;
    }

    /**
   * 检查类定义时scheme修饰器限定的schema中存在且doc中也存在的属性值是否符合schema的要求
   *
   * @static
   * @param {object} doc - 要检查的对象
   * @param {boolean} [isPartialObj=true] - if isPartialObj is set to true, skip check on the fields which are required but not exist on doc
   * @returns {Map} - 如果有错误则返回错误，否则返回空值
   * @memberof DocSchema
   */
    static validateObj(doc: object, isPartialObj: boolean = true) {
        console.group(`~ validating ${isPartialObj ? 'partial' : ''} obj: `, doc);
        const errors = new Map();

        if (!isNil(doc) && !isObject(doc)) return errors.set('类型错误', `值必须为对象`);

        this.schema.checkers.forEach((checker, key) => {
            if (isPartialObj && !(key in doc)) return;
            checker.on(doc[key]);
            if (checker.errors.size) errors.set(key, checker.errors);
        });

        console.groupEnd();
        return errors.size ? errors : void 0;
    }

    /**
   *  作用同validateObj和validateProp，但有2处不同：1.如果出错会抛出异常，2.会自动清除x中有但在schema中没有的属性
   *
   * @static
   * @param {(object | string)} x 如果x是字符串，则x代表是键名，value代表键值；
   * @param {*} [value]
   * @memberof DocSchema
   */
    static check(x: object);
    static check(x: string, value?);
    static check(x, value?) {
        let errors: Map<string, any>;
        // default to clean the object automatically
        if (typeof x == 'object') errors = this.validateObj(this.clean(x));
        if (typeof x == 'string') errors = this.validateProp(x, value);

        if (errors) {
            const msg = convertMapOrSetToString(errors);
            console.error(msg);
            throw new Meteor.Error(400, '数据有误', msg);
        }
    }

    static wrapDoc(rawDoc?) {
        if (!isObject(rawDoc)) throw Error('只能转换对象');
        const instance = makeInstanceOfDocSchema(rawDoc, this);
        instance._doc = rawDoc;
        return instance;
    }

    @restrictedProperty(true)
    protected _doc?; // 存储原始档案，以便比对变更之处
}

export function scheme(pattern?) {
    // in es6, all methods in prototype are NOT enumarable. Has to copy them using assignWithMethods.
    const checker = assignWithMethods(propDescriptor, new Checker(), Checker.prototype);
    return checker.type(pattern);

    function propDescriptor(o: DocSchema, p: string) {
        if (!(o instanceof DocSchema)) throw Error(`${o} has to be instanceof DocSchema`);

        const schema = (o.constructor as typeof DocSchema).schema;
        (schema.config[p] = checker.config), (checker.prop = p);
        schema.checkers.set(p, checker);

        fixupFuncArrayConfig(schema, checker);
    }
}

export class Checker {
    value: any;
    prop: string;
    pattern: any;
    config: { [key: string]: any } = {};
    rules: Map<string, any> = new Map();
    errors: Map<string, any> = new Map();
    isOptional = false;

    on(value): Map<string, any> {
        this.errors.clear();

        console.group(`> checking key [${this.prop}] value:  ${value}`);
        this.value = value;

        this.required();

        this.rules.forEach((rule, ruleName) => {
            const err = rule.call(this);
            console.log(`rule <${ruleName.toUpperCase()}>...`, err ? `Error: ${err}` : 'done');
        });
        console.groupEnd();
        return this.errors.size ? this.errors : void 0;
    }

    // same as the check of Meteor::check
    type(pattern: Function | [Function] = String, errMsg?: string) {
        const _this = this;
        this.pattern = this.config.type = pattern;
        this.rules.set('type', function() {
            const errors = checkOnPattern.call(_this, pattern, this.value);
            if (errors) return this.addError('类型错误', errMsg || errors);
        });
        return this;
    }

    max(n: number, errMsg?: string) {
        this.config.max = n;
        this.rules.set('max', function() {
            if (!isNil(this.value)) {
                if (this.isStringOrArray() && this.value.length > n)
                    return this.addError('超过最大长度', errMsg || `长度不能超过${n}`);
                else if (this.isNumber() && this.value > n) return this.addError('超过最大值', errMsg || `不能大于最大值${n}`);
            }
        });
        return this;
    }

    min(n: number, errMsg?: string) {
        this.config.min = n;
        this.rules.set('min', function() {
            if (!isNil(this.value)) {
                if (this.isStringOrArray() && this.value.length < n)
                    return this.addError('超过最小长度', errMsg || `长度不能小于${n}`);
                else if (this.isNumber() && this.value < n) return this.addError('超过最小值', errMsg || `不能小于最小值${n}`);
            }
        });
        return this;
    }

    range(min: number, max: number, errMsg?: string) {
        this.min(min, errMsg);
        this.max(max, errMsg);
        return this;
    }

    len(l: number, errMsg?: string) {
        this.config.length = l;
        this.rules.set('length', function() {
            if (!isNil(this.value) && this.isStringOrArray() && this.value.length != l)
                return this.addError('长度不对', errMsg || `长度必须为${l}`);
        });
        return this;
    }

    regEx(r: RegExp, errMsg?: string) {
        this.config.regEx = r;
        this.rules.set('regEx', function() {
            if (this.isNumberOrString() && !r.test(this.value)) {
                return this.addError('违反范式', errMsg || '不符合规范要求');
            }
        });
        return this;
    }

    required(errMsg?: string) {
        this.rules.set('required', function() {
            if (!this.isOptional && isNil(this.value)) return this.addError('必填内容', errMsg || '该值不能空着');
        });
        return this;
    }

    addError(key: string, msg: string): string {
        if (msg) this.errors.set(key, msg);
        return msg;
    }

    optional() {
        this.isOptional = this.config.optional = true;
        return this;
    }

    isStringOrArray() {
        return this.pattern == String || this.pattern == Array;
    }

    isNumber() {
        return this.pattern == Number;
    }

    isNumberOrString() {
        return this.pattern == Number || this.pattern == String;
    }
}

// for [String] like type, fix up the config with longhand regarding to Simpl-Schema
function fixupFuncArrayConfig(schema, checker) {
    if (isFuncArray(checker.config.type)) {
        checker.config.type = Array;
        schema.config[checker.config.prop + '.$'] = checker.config.type[0];
    }
}

function checkOnPattern(pattern, value, errMsg) {
    let errors;
    if (isTypeOfDocSchema(pattern)) {
        errors = pattern.check(value);
        if (errors) return this.addError('内层错误', errMsg || errors);
    } else {
        try {
            check(value, pattern);
        } catch (e) {
            errors = e.message || e.details || e.reason || e;
        }
        if (!errors && value && isFuncArray(pattern)) {
            errors = checkArrayValue(pattern, value, errMsg);
        }
    }

    if (errors) return this.addError('类型错误', errMsg || errors);
}

function checkArrayValue(pattern, value, errMsg) {
    const errMap = new Map();
    (value as any[]).forEach((item, index) => {
        const errors = checkOnPattern(pattern[0], item, errMsg);
        if (errors) errMap.set(`#${index}`, errors);
    });
    if (errMap.size) return errMap;
}

function assignWithMethods(target, ...sources: object[]) {
    for (let i= sources.length; i>0;){
        const source = sources[--i];
        for (let key of Object.getOwnPropertyNames(source)) target[key] = source[key];
    };

    return target;
}

// // Non-Meteor project has no check function, it has to use this stub:
// function check(v, p) {
//   if (!v) return;
//   if (_.isObject(v) && !(v instanceof p)) throw new Error('对象类型不匹配');
//   else if (typeof v != typeof p()) throw new Error('值类型不匹配');
// }

function makeInstanceOfPattern(dataSource, pattern: Function | [Function]) {
    if (isArray(pattern)) {
        return makeInstanceOfFuncArray(dataSource, pattern);
    } else if (isPrimitiveConstructor(pattern)) {
        if (isObject(dataSource)) throw new Match.Error(`Schema违例: 值必须为${pattern.name}类型，不能是对象`);
        return dataSource;
    } else if (isObjectConstructor(pattern)) {
        return isTypeOfDocSchema(pattern) ? makeInstanceOfDocSchema(dataSource, pattern) : cloneDeep(dataSource);
    }
}

function makeInstanceOfDocSchema(dataSource, maker: typeof DocSchema) {
    let result = new maker();
    if (isNil(dataSource)) return result;
    if (isPlainObject(dataSource) || isDocSchemaInstance(dataSource)) {
        // 只初始化scheme修饰过的属性, "忽略"dataSource中的其它属性
        maker.schema.checkers.forEach((checker, key) => {
            result[key] = makeInstanceOfPattern(dataSource[key], maker.schema.checkers.get(key).pattern);
        });
        return result;
    }
    throw new Match.Error(`Schema违例: 值必须为${maker.name}类型实例对象`);
}

function makeInstanceOfFuncArray(dataSource, maker: [Function]) {
    let result = [];
    if (isNil(dataSource)) return result;
    if (!isArray(dataSource)) throw new Match.Error(`Schema违例: [${dataSource}]值必须为数组`);
    dataSource.forEach((item) => result.push(makeInstanceOfPattern(item, maker[0])));
    return result;
}

export function isDocSchemaInstance(value) {
    return isObject(value) && value instanceof DocSchema;
}

export function isTypeOfDocSchema(pattern): pattern is typeof DocSchema {
    return isFunction(pattern) && pattern.prototype instanceof DocSchema;
}

export function isFuncArray(pattern): pattern is [Function] {
    return isArray(pattern) && pattern.length == 1 && isFunction(pattern[0]);
}
