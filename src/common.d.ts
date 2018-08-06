
declare type Constructor = new (...args) => any;
declare type NumberConstructor = new (...args) => Number;
declare type StringConstructor = new (...args) => String;
declare type BooleanConstructor = new (...args) => Boolean;
declare type SymbolConstructor = (...args) => symbol;

declare type PrimitiveConstructor = NumberConstructor | StringConstructor | BooleanConstructor | SymbolConstructor;
declare type ObjectArray = [Constructor];
declare type Primitive = string | number | symbol | boolean | null | undefined;
declare type Enum = Primitive[];
declare type Nil = null | undefined;

declare type Dictionary<T> = { [key: string]: T }
declare type PartialMapTo<T, M> = Partial<Record<keyof T, M>>
declare type OnlyArrays<T> = T extends any[] ? T : never;
declare type OnlyElementsOfArrays<T> = T extends any[] ? Partial<T[0]> : never
declare type ElementsOf<T> = {
[P in keyof T]?: OnlyElementsOfArrays<T[P]>
}
