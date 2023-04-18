import { computed, markRaw, toRefs } from "vue"
import { assign, isFun } from "./utils"
import { setActivePinia } from "./rootStore"
import craeteSetupStore from "./craeteSetupStore"

export default function createOptionsStore($id, options, pinia) {
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
    // debugger
    // 处理 getters
    const computedGetters = Object.entries(getters || {}).reduce((memoGetters, [name, getter]) => {
      memoGetters[name] = markRaw(computed(() => {
        setActivePinia(pinia)
        // 获取 状态仓库
        const store = pinia._s.get($id)
        return getter.call(store, store)
      }))
      return memoGetters
    }, {})
    // 将 state，actions 和 getters 拍平
    return assign(localStore, actions, computedGetters)
  }

  return craeteSetupStore($id, setup, options, pinia, true)
}