// 创建 pinia 实例
import { effectScope, markRaw, ref } from 'vue'
import { piniaSymbol } from './rootStore'
import { assign } from './utils'

// 创建 Pinia 实例
export function createPinia() {
  const scope = effectScope(true)
  // 初始化状态
  const state = scope.run(() => ref({}))
  const _p = []
  // 判断是否已经安装
  let toBeInstalled = []
  // 创建 pinia 实例
  const pinia = markRaw({
    install(app) {
      console.log('pinia installed', app, pinia)
      // 挂载 Vue 实例
      pinia._a = app
      // 注入 pinia 实例
      app.provide(piniaSymbol, pinia)
      // 设置 app 实例内部全局熟悉
      app.config.globalProperties.$pinia = pinia

      // 注册插件
      toBeInstalled.forEach(plug => _p.push(plug))
      toBeInstalled = []
    },
    use(plugin) {
      // 安装 pinia 插件
      toBeInstalled.push(plugin)
      return this
    }
  })
  // 返回 pinia 实例
  return assign(pinia, {
    state,
    _a: null,
    _e: scope,
    _s: new Map,
    _p
  })
}