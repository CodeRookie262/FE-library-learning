const isPromise = instance => instance instanceof Promise
const getType = target => Object.prototype.toString.call(target).slice(8, -1)
const reduxPromise = () => next => action => {
  // 如果 action 传递的是一个 Promise 实例
  if (isPromise(action)) return action.then(next)
  // feature => 如果是 AsyncFunction
  if (getType(action) === 'AsyncFunction') action().then(next)
  // feature => 如果是 GeneratorFunction
  if (getType(action) === 'GeneratorFunction') {
    const generator = action()
    const values = []
    while (1) {
      const {done, value} = generator.next()
      if (value != null) values.push(value)
      if (done) {
        next(values.pop())
        break
      }
    }
  }
  return next(action)
}

export default reduxPromise