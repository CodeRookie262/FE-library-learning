export const applyMiddleware = function (...middleware) {
  return function (createStore) {
    return function (reducer, preloadedState) {
      // 创建状态仓库
      const state = createStore(reducer, preloadedState)
      let dispatch = () => {
        throw new Error('中间件构建异常了~')
      }
      const middlewareAPI = {
        getState: state.getState,
        // 间接调用 dispatch 派发方法
        dispatch: (action, ...args) => dispatch(action, ...args)
      }
      // 串联中间件链
      const chain = middleware.map(middleware => middleware(middlewareAPI))
      // 修饰 dispatch
      dispatch = compose(...chain)(state.dispatch)
      return {
        ...state,
        dispatch
      }
    }
  }
}

// middleware 中间件函数的结构如下
/**
 * const middle = (store) => next => action => {
 *   // store 是中间件再串联为中间链的时候传进来的 middlewareAPI
 *   // next 则是下一个中间件
 *   // 说到底中间件就是对 dispatch 进行修饰，劫持
 *   if (typeof next === 'function') next(action) 
 * }
 */
