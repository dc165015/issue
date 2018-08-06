import { check, Match } from "meteor/check";
import { isArray, isFunction } from "lodash";
import { Meteor } from "meteor/meteor";

export function hasOwn(obj, key) {
  return Reflect.ownKeys(obj).includes(key);
}

export function convertMapOrSetToString(data: Map<any,any> | Set<any>) {
  return JSON.stringify(data, (key: string, value) => {
    value instanceof Map || value instanceof Set ? Array.from(value) : value;
  });
}

// reference: https://www.typescriptlang.org/docs/handbook/mixins.html
export function mixinClasses(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
      Reflect.ownKeys(baseCtor.prototype).forEach(name => {
          derivedCtor.prototype[name] = baseCtor.prototype[name];
      });
  });
}

export function requireLogin(msg: string = '用户未登录') {
  if (!Meteor.userId()) throw new Meteor.Error('未登录', msg);
}

export const NonEmptyString = Match.Where((x) => {
  check(x, String);
  return x.length > 0;
});

export function checkId(id: string) {
  check(id, NonEmptyString);
}

export function clampString(str: string, minLength: number = 1, maxLength?: number) {
  check(str, String);
  const lenth = str.length;
  if (maxLength == void 0) {
    if (length != minLength) throw Match.Error(`"${str}" is not ${minLength}`);
  } else {
    if (length < minLength) throw Match.Error(`"${str}" 长度小于最小长度 ${minLength}`);
    if (length > maxLength) throw Match.Error(`"${str}" 长度大于最大长度 ${maxLength}`);
  }
}

export function splitArray(array: any[], distinctor: (value: any) => boolean): [any[], any[]] {
  const truth = [];
  const fault = [];
  for (let i = 0; i < array.length; i++) {
    const value = array[i];
    distinctor(value) ? truth.push(value) : fault.push(value);
  }
  return [ truth, fault ];
}

export function isEmptyArray(value) {
  if (isArray(value) && value.length == 0) return true;
}

export function isPrimitiveConstructor(func) {
  return [String, Number, Boolean, Symbol].includes(func);
}

export function isObjectConstructor(func): func is (...args) => void{
  return isFunction(func) && !isPrimitiveConstructor(func);
}

export function deleteKeys(object, ...args) {
  args.forEach((key) => delete object[key]);
  return object;
}

export function restrictedProperty(writable: boolean = false, configurable: boolean = false, enumerable: boolean = false) {
  return function(target: object, propertyKey: string) {
    Object.defineProperty(target, propertyKey, { writable, configurable, enumerable });
  };
}

export function restrictedMethod(writable: boolean = false, configurable: boolean = false, enumerable: boolean = false) {
  return function(target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.configurable = configurable, descriptor.enumerable = enumerable, descriptor.writable = writable;
  };
}

export function restrictedAccessor(configurable: boolean = false, enumerable: boolean = false) {
  return function(target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.configurable = configurable, descriptor.enumerable = enumerable;
  };
}
