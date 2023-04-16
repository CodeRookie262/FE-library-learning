// 创建一个引用对象，包含 store 的所有 state、 getter 和 plugin 添加的 state 属性。
// https://pinia.vuejs.org/zh/api/modules/pinia.html#storetorefs

import { isReactive, isRef, toRaw, toRef } from "vue";

export function storeToRefs(store) {
  store = toRaw(store)
  return Object.keys(store).reduce((refs, key) => {
    const val = store[key]
    if (isRef(val) || isReactive(val)) {
      refs[key] = toRef(store, key)
    }
    return refs
  }, {})
}