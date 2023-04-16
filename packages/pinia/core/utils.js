import { isReactive, isRef } from "vue"

// normal utils
export const assign = Object.assign

export const getType = val => (Object
  .prototype
  .toString
  .call(val)
  .slice(8, -1)
  .toLowerCase())

export const compareType = (target, type) => getType(target) === String(type).trim().toLowerCase()

export const isStr = str => compareType(str, 'string')

export const isFun = fn => compareType(fn, 'function')

export const isPlainObject = obj => compareType(obj, 'object')

export const isNativeFun = fn => isFun(fn) && fn.toString().includes('[native code]')

// Vue3 utils
export const isComputed = r => !!(isRef(r) && r.effect)

export function mergeRectiveObjects(target, patchToApply) {
  // 处理 Map 、Set 特殊数据结构的合并, 直接覆盖键值对即可
  if (target instanceof Map && patchToApply instanceof Map) {
    patchToApply.forEach((value, key) => target.set(key, value))
  }
  if (target instanceof Set && patchToApply instanceof Set) {
    patchToApply.forEach((key, value) => target.add(key, value))
  }

  for (const key in patchToApply) {
    // 判断是否是自身的属性
    if (!patchToApply.hasOwnProperty(key)) return
    const newProp = patchToApply[key]
    const oldProp = target[key]
    if (isPlainObject(newProp) &&
      isPlainObject(oldProp) &&
      target.hasOwnProperty(key) &&
      !isRef(newProp) &&
      !isReactive(newProp)) {
      target[key] = mergereactiveObjects(oldProp, newProp)
    } else {
      target[key] = newProp
    }
  }
}