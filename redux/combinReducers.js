import ActionTypes from './utils/action-types'


// 初始化断言，判断 reducer 函数是否是标准且合理的
function assertReducerShape (reducers) {
  Object.keys(reducers).forEach(key => {
    const reducer = reducers[key]
    const initialState = reducer(undefined, { type: ActionTypes.INIT })
    if (typeof initialState === 'undefined') {
      throw new Error(`combinReducers 中的 ${key} 返回值不能是 null 或 undefined，应该在函数内部对 state 进行初始化控制。`)
    }
  })
}

/**
 * 将多个 reducer 函数进行合并
 * @param {reducer} reducers
 */
const combinReducers = function (reducers) {
  // 获取用户要合并的 reducer 模块列表
  const reducerKeys = Reflect.ownKeys(reducers)
  const finalReducers = reducerKeys.reduce((memoReducers, reducerKey) => {
    const currentReducer = reducers[reducerKey]
    if (typeof currentReducer === 'function') {
      finalReducers[reducerKey] = currentReducer
    }
    return memoReducers
  }, {})
  // 合并前先校验下用户写的 reducer 是否规范
  let shapeAssertionError
  try {
    assertReducerShape(finalReducers)
  } catch (e) {
    shapeAssertionError = e
  }
  return function combination (state, action) {
    // 判断 reducers 合并前是否存在异常
    if (shapeAssertionError) throw shapeAssertionError
    let hasChanged = false
    const nextState = {}
    // 遍历 finalReducers
    Object.entries(finalReducers).forEach(([key, reducer]) => {
      // 获取之前的状态
      const previousStateForKey = state[key]
      const nextStateForKey = reducer(state, action)
      if (typeof nextStateForKey === 'undefined') throw new Error(`combinReducers 中的 ${key} 返回值不能是 null 或 undefined，应该在函数内部对 state 进行初始化控制。`)
      nextState[key] = nextStateForKey
      // 判断 state 引用是否有改动，对于这里的处理，mbox 的响应式变更性能更加地好
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    })
    hasChanged = hasChanged || Object.keys(finalReducers).length === Object.keys(state).length
    return hasChanged ? nextState : state
  }
}

export default combinReducers