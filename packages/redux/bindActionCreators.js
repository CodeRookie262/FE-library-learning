const bindActionCreator = (actionCreator, dispatch) => {
  return function () {
    return dispatch(actionCreator.apply(...[].slice.call(arguments)))
  }
}

export const bindActionCreators = (actionCreators, dispatch) => {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch)
  }
  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error(`actionCreator 必须为一个函数，但现在获取的类型是 ${typeof actionCreator}`)
  }
  const boundActionCreators = {}
  Object.entries(actionCreators).forEach(([key, actionCreator]) => {
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch)
    }
  })
  return boundActionCreators
}