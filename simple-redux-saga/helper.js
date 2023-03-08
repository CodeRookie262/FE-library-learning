export const noop = () => { }
export const isIterator = saga => saga && (saga[Symbol.iterator] instanceof Function)
