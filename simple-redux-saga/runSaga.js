import { FORK, PUT, TAKE } from "./constants"
import { isIterator } from "./helper"
import stdChannel from "./stdChannel"

export const dispatch = (action) => {
  stdChannel.put(action)
}

export function runSaga(saga) {
  const iterator = isIterator(saga) ? saga : saga()
  function next(...args) {
    const { value: effect, done } = iterator.next(...args)
    if (done) return
    const effectType = effect.effectType
    if (effect) {
      if (effect && typeof effect.then === 'function') {
        return effect.then(next)
      } else if (isIterator(effect)) {
        runSaga(effect)
      }
      switch (effectType) {
        case TAKE: {
          stdChannel.take(effect.actionType, next)
          break
        }
        case PUT: {
          dispatch(effect.action)
          next(...args)
          break
        }
        case FORK: {
          runSaga(effect.effect)
        }
        default: next(...args)
      }
    }
  }
  next()
}