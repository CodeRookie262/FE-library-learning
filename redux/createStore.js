import actionTypes from "./utils/action-types"
import $$observable from "./utils/symbol-observable"
/**
 * 创建状态器仓库
 * @param {Function} reducer 状态处理函数
 * @param {Object | Function} preloadedState 默认状态
 * @param {Function} enhancer 插件
 */
const createStore = function (reducer, preloadedState, enhancer) {
  if (typeof reducer !== 'function') return new Error('reducer 必须为一个函数')
  if (
    (typeof preloadedState === 'function' && enhancer === 'function') ||
    (typeof enhancer === 'function' && arguments[3] === 'function')
  ) {
    return new Error('createStore() 不支持多参数传递多个插件，对此可采取 compose() 将他们合并为一个插件并导入即可。')
  }
  /**
   * 初始化处理
   * 假如 preloadedState 传递的是一个插件函数，并且 enhancer 为传值的情况下，
   * 会将 preloaderState 赋值给 enhancer 走插件处理逻辑，并且将 preloaderState 设置为 null
   */
  if (typeof preloadedState === 'function' && enhancer == undefined) {
    [preloadedState, enhancer] = [null, preloadedState]
  }
  if (typeof enhancer != undefined && typeof enhancer !== 'function') {
    return new Error('插件必须为一个函数，当前得到的参数类型为', typeof enhancer)
  } else if (typeof enhancer === 'function') {
    // 采用插件生成新仓库
    return enhancer(createStore)(reducer, preloadedState)
  }
  let currentReducer = reducer
  let currentState = preloadedState
  let currentListeners = []
  let nextListeners = currentListeners
  let isDispating = false

  /**
   * 生成新的订阅队列，防止对同一个引用同时做处理时发送异常
   */
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }

  // 获取状态
  function getState() {
    if (isDispating) throw new Error('事件正在派发中，请在派发完成后再获取最新的状态')
    return currentState
  }

  // 订阅事件
  function subscribe(listener) {
    if (typeof listener !== 'function') throw new Error(`listener 必须为一个函数，当前的类型为 ${typeof listener}`)
    const isSubscribed = true
    // 刷新订阅订阅队列
    ensureCanMutateNextListeners()
    nextListeners.push(listener)
    // 返回一个事件注销的函数，可以将此处订阅的时间移出订阅队列中
    return function unsubscribe() {
      if (!isSubscribed) throw new Error('该事件已移出订阅队列中')
      if (isDispating) throw new Error('订阅队列正在执行中，请勿在执行过程中移出事件。')
      // 表示该事件已经挪出订阅队列
      isSubscribed = false
      // 再次刷新订阅队列,因为对订阅队列做了调整，所以得拷贝一份新的引用防止在修改队列过程中出现数组崩塌现象
      ensureCanMutateNextListeners()
      const index = nextListeners.findIndex(listener)
      nextListeners.splice(index, 1)
      currentListeners = null
    }
  }

  // 派发事件对象
  function dispatch(action) {
    const actionType = typeof action
    if (action == undefined || typeof action == 'function') {
      throw new Error(`action 必须为一个纯对象，但现在的类型为 ${actionType}`)
    }
    if (isDispating) throw new Error('正在派发中，请勿重复派发')
    // 开始将 action 派发到 reducer 中
    try {
      isDispating = true
      currentState = currentReducer(currentState, action)
    } finally {
      isDispating = false
    }
    // 完成派发后，开始发布订阅队列中的事件，保证获取最新的订阅队列
    const listeners = currentListeners = nextListeners
    listeners.forEach(listener => listener())
    return action
  }

  // 替换 reducer
  function replaceReducer(nextReducer) {
    const nextReducerType = typeof nextReducer
    if (nextReducerType != 'function') throw new Error(`nextReducer 类型必须为 function，但现在的类型是 ${nextReducerType}`)
    // 替换最新的 reducer
    currentReducer = nextReducer
    // 替换完成后生成最新的 store
    dispatch({type: actionTypes.REPLACE})
    // 返回新的store
    return store
  }

  // 创建响应式监听器
  /**
   * 可添加一个获取最新状态的订阅器，用于监听数据的变化
   * const observer = observable()
   * observer({
   *    next (newState) {
   *      console.log('最新的 newState')
   *    }
   * })
   */
  function observable () {
    // 获取外部的订阅器
    const outerSubscribe = subscribe
    return {
      subscribe (observer) {
        const observerType = typeof observer
        if (observable == null || observerType == 'function') throw new Error(`observer 参数类型必须为 object， 但现在获取的类型为 ${observerType}`)
        
        function observeState () {
          const observerAsObserver = observable
          if (typeof observerAsObserver.next === 'function') observerAsObserver.next(getState())
        }

        observeState()
        const unsubscribe = outerSubscribe(observeState)
        return {unsubscribe}
      },
      [$$observable] () {
        return this
      }
    }
  }

  dispatch({type: actionTypes.INIT})
  const store = {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
  return store
}

export default createStore