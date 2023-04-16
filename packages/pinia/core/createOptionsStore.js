import { computed, markRaw, toRefs } from "vue"
import { assign, isFun } from "./utils"
import { setActivePinia } from "pinia"
import craeteSetupStore from "./craeteSetupStore"

export const createOptionsStore = ($id, options, pinia) => {
  const { state, actions, getters } = options

  // 获取初始化状态
  const initState = pinia.state.value[$id]

  // 包装一个 setup 函数

  const setup = () => {
    // 初始化状态值
    if (!initState) {
      pinia.state.value[$id] = isFun(state) ? state() : {}
    }

    const localStore = toRefs(pinia.state.value[$id])

    const computedGetters = Object.entries(getters || {}).reduce((memoGetters, [name, getter]) => {
      memoGetters[name] = markRaw(() => {
        computed(() => {
          setActivePinia(pinia)
          // 获取 状态仓库
          const store = pinia._s.get($id)
          return getter[name].call(store, store)
        })
      })
      return memoGetters
    }, {})
    return assign(localStore, actions, computedGetters)
  }

  return craeteSetupStore($id, setup, options, pinia, true)
}