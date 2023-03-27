export default function thunk({ dispatch, getState }) {
  return function (next) {
    return function (action) {
      // 如果 action 传递的是一个 function 类型，则可能是一个 actionCreator
      if (typeof action === 'function') {
        return action(dispatch, getState)
      }
      // 如果 action 并不是函数，而是一个普通的对象则传递给下一个插件就行处理即可
      return next(action)
    }
  }
}