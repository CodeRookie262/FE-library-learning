import { effectScope, markRaw, nextTick, reactive, watch, isReactive, toRaw, isRef } from "vue"
import { addSubscription, triggerSubscriptions } from "./subscriptions"
import { assign, isComputed, isFun, mergeRectiveObjects } from "./utils"
import { setActivePinia } from "pinia"

export default function craeteSetupStore($id, setup, options, pinia, isOptionsStore) {
  let scope
  const optionForPlugin = {
    actions: {},
    ...options
  }
  // 设置订阅相关的配置
  const $subscribeOptions = {
    deep: true
  }

  // 定义内部的一些状态
  let isListening = false
  let isSyncListening = false
  let subscribes = markRaw([])
  // 获取状态
  const initState = pinia.state.value[$id]
  const actionSubscriptions = []

  // 初始化状态
  // 判断是否是 createOptionsStore 进来的，并且已经初始化状态了则不需要再次初始化
  if (!isOptionsStore && !initState) {
    pinia.value[$id] = {}
  }

  let activeListener

  function $patch(partialStateOrMutator) {
    let subscribeMutation
    isListening = isSyncListening = false

    if (isFun(partialStateOrMutator)) {
      partialStateOrMutator(pinia.state.value[$id])
    } else {
      // 合并对象
      mergeRectiveObjects(pinia.state.value[$id], partialStateOrMutator)
    }

    const MyListenerId = activeListener = Symbol()
    nextTick().then(() => {
      if (MyListenerId === activeListener) {
        isListening = true
      }
    })
    isSyncListening = true

    // 触发订阅函数
    triggerSubscriptions(subscribes, subscribeMutation, pinia.state.value[$id])
  }

  // 重置状态
  function $reset() {
    const { state } = options
    const newState = state ? state() : {}
    this.$patch($state => assign($state, newState))
  }

  // 订阅 action
  function $onAction(...args) {
    return addSubscription(actionSubscriptions, ...args)
  }

  // 停止 store 的相关作用域，并从 store 注册表中删除它。
  function $dispose() {
    scope.stop()
    subscribes = []
    actionSubscriptions = []
    pinia._s.deleta($id)
  }

  // 将每一个 action 动作封装为一个订阅函数
  function wrapAction(name, action) {
    return function (...args) {
      setActivePinia(pinia)
      const afterCallbackList = []
      const onErrorCallbackList = []

      function after(fn) {
        afterCallbackList.push(fn)
      }

      function onError(fn) {
        onErrorCallbackList.push(fn)
      }

      // 触发订阅函数
      triggerSubscriptions(actionSubscriptions, {
        args,
        name,
        store,
        after,
        onError
      })

      let ret
      try {
        ret = action.apply(this && this.id === $id ? this : store, args)
      } catch (err) {
        triggerSubscriptions(onErrorCallbackList, err)
      }

      if (ret instanceof Promise) {
        ret.then(value => {
          triggerSubscriptions(afterCallbackList, value)
          return value
        }).catch(err => {
          triggerSubscriptions(onErrorCallbackList, err)
          return Promise.reject(err)
        })
      }

      triggerSubscriptions(afterCallbackList, ret)

      return ret
    }
  }

  function $subscript(cb) {
    const removeSubscript = addSubscript(
      subscribes,
      cb,
      options.detached,
      () => stopWatcher()
    )

    const stopWatcher = scope.run(() => {
      watch(() => pinia.state.value[$id], state => {
        if (options.flush ? isSyncListening : isListening) {
          cb({
            storeId: $id,
            type: MutationType.direct
          },
            state,
            {
              ...$subscribeOptions,
              ...options
            })
        }
      })
    })

    return removeSubscript
  }


  const partialStore = {
    _p: pinia,
    $id,
    $patch,
    $reset,
    $dispose,
    $subscript,
    $onAction
  }
  // 将响应式状态储存起来，后续复用避免重复创建
  const store = reactive(partialStore)
  pinia._s.set($id, store)

  const setupStore = pinia._e.run(() => {
    scope = effectScope()
    return scope.run(() => setup())
  })
  for (const key in setupStore) {
    const prop = setupStore[key]
    // 判断是否是响应式数据
    if (isRef(prop) && isComputed(prop) || isReactive(prop)) {
      // createOptionsStore 中的数据已经经过响应式处理了，这里可以跳过
      if (!isOptionsStore) {
        if (initState && isRef(prop)) {
          prop.value = initState[key]
        } else {
          mergeRectiveObjects(prop, initState[key])
        }
        // 更新 pinia 状态
        pinia.state.value[$id][key] = prop
      }
    } else if (isFun(prop)) {
      // 进入到这里的都是 action 动作函数
      // 对 action 进行包装
      const activeValue = wrapAction(key, prop)
      setupStore[key] = activeValue
    }
  }

  // 合并仓库
  assign(store, setupStore)
  assign(toRaw(store), setupStore)

  // 对 store 进行代理操作
  Object.defineProperty(store, '$state', {
    get: () => pinia.state.value[$id],
    set(state) {
      // 合并新旧状态
      $patch($state => assign($state, state))
    }
  })

  // 执行 pinia 插件
  pinia._p.forEach(extender => {
    // 获取插件返回的仓库变更结果
    const extendStore = scope.run(() => extender({
      app: pinia._a,
      options: optionForPlugin,
      store,
      pinia
    }))
    // 进行合并操作
    assign(store, extendStore)
  })

  isListening = true
  isSyncListening = true

  return store
}