
// a class decorator, prevents malicious data injection, intends to use only in constructor
export function sealed<T extends { new (...args: any[]): {} }>(originConstructor: T) {
    return class extends originConstructor {
        constructor(...args) {
            super(...args);
            Object.seal(this);
            if (args.length === 1) {
                try {
                    Object.assign(this, ...args);
                } catch (e) {
                    console.warn(`Malice: extend ${originConstructor.name} is forbidden`, e, args);
                }
            }
        }
    };
}

// Depreciated: use Object.keys(str).length insteadly
export function getMixedStringLength(str) {
    let arr = str.match(/[^ -~]/g);
    // 常用英文字符集外的字符长度统统算作2个字符
    return arr ? str.length + arr.length : str.length;
}
