export function defineGetter(obj: object, name: string, getter: (() => any)) {
    Object.defineProperty(obj, name, {
        configurable: true,
        enumerable: true,
        get: getter
    })
}

export function defineSetter(obj: object, name: string, setter: ((...args: any) => any)) {
    Object.defineProperty(obj, name, {
        configurable: true,
        enumerable: true,
        set: setter
    });
}