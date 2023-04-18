// 引入必要的 Vue 3 模块
import { effectScope, markRaw, ref } from 'vue'
// 引入 Pinia 实例标识
import { piniaSymbol } from './rootStore'
// 引入 assign 工具函数
import { assign } from './utils'

// 创建 Pinia 实例的函数
export function createPinia() {
  // 创建作用域实例，该实例用于管理 Pinia 实例的副作用
  const scope = effectScope(true)
  // 使用作用域实例创建响应式状态对象
  const state = scope.run(() => ref({}))
  // 创建用于存储插件的数组
  const _p = []
  // 创建用于存储未安装插件的数组
  let toBeInstalled = []

  // 创建 Pinia 实例对象
  const pinia = markRaw({
    // Pinia 实例的安装方法
    install(app) {
      // 打印安装信息
      // console.log('pinia installed', app, pinia)
      // 将 Vue 实例赋值给 Pinia 实例的私有属性
      pinia._a = app
      // 在 Vue 实例中注入 Pinia 实例
      app.provide(piniaSymbol, pinia)
      // 在 Vue 实例内部的全局属性中添加 Pinia 实例
      app.config.globalProperties.$pinia = pinia

      // 如果有插件需要安装，将插件添加到插件数组中
      toBeInstalled.forEach(plug => _p.push(plug))
      // 清空待安装插件数组
      toBeInstalled = []
    },
    // Pinia 实例的插件安装方法
    use(plugin) {
      // 将插件添加到待安装插件数组中
      toBeInstalled.push(plugin)
      return this
    }
  })

  // 打印 Pinia 实例
  // console.trace('[createPinia]', pinia)
  // 将创建的 Pinia 实例对象合并到 state 对象中，并返回合并后的对象
  return assign(pinia, {
    state,
    _a: null,
    _e: scope,
    _s: new Map,
    _p
  })
}
