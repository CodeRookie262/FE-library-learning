import { getCurrentInstance, inject } from "vue"
import { activePinia, piniaSymbol, setActivePinia } from "./rootStore"
import createSetupStore from "./craeteSetupStore"
import createOptionsStore from "./createOptionsStore"
import { isFun } from "./utils"
/**
 * 定义状态仓库 
 * @param {string | object} idOrOptions store 标识符
 * @param {object | function} setup store创建器
 * @param {object} setupOptions store配置
 */
export function defineStore(idOrOptions, setup, setupOptions) {
  let id, options

  // 判断 setup 是否是一个函数
  const isSetupStore = isFun(setup)

  // 入参兼容适配
  if (typeof idOrOptions == 'string') {
    id = idOrOptions
    // 如果存在创建器函数则取 setupOptions 作为配置
    options = isSetupStore ? setupOptions : setup
  } else {
    options = setupOptions
    id = idOrOptions.id
  }

  /**
   * useStore 函数用于在组件中使用状态仓库
   * @param {object} pinia Pinia 实例
   * @returns {object} 状态仓库
   */
  function useStore(pinia) {
    // 获取当前组件实例
    const currentInstance = getCurrentInstance()

    // 如果当前组件实例存在，则从该实例中注入 pinia 实例
    if (currentInstance) pinia = inject(piniaSymbol)

    // 设置正在应用的实例
    if (pinia) setActivePinia(pinia)

    // 获取正在使用的 pinia 实例
    pinia = activePinia

    // 判断当前状态库是否定义过，走缓存策略
    if (!pinia._s.has(id)) {
      // 创建状态库
      // 两种策略，如果 setup 传入类型是函数则走 createSetupStore，否则走 createOptionsStore
      if (isSetupStore) {
        createSetupStore(id, setup, options, pinia)
      } else {
        createOptionsStore(id, options, pinia)
      }
    }

    // 采用单例模式，如果之前创建过则从 Map 取出来再次返回即可
    const store = pinia._s.get(id)

    return store
  }

  return useStore
}
