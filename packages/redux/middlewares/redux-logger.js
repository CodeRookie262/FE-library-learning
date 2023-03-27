export default function ({getState}) {
  return function (next) {
    return function (action) {
      console.group('redux-logger')
      console.log('prev state', getState())
      console.log('action', action)
      const res = next(action)
      console.log('next state', getState())
      console.groupEnd()
      return res
    }
  }
}