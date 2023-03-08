import {runSaga, dispatch} from './index'
import {take, takeEvery, put} from './effects'

const noop = () => {}

function delay(ms, cb, ...args) {
    if (!(cb instanceof Function)) {
      args = [cb, ...args]
      cb = noop
    }
    return new Promise(resolve => {
      const timer = setTimeout((...args) => {
        resolve(args)
        cb(...args)
        clearTimeout(timer)
      }, ms, ...args)
    })
  }
  
  function* saga() {
    yield take('CallSaga')
    yield delay(1000, console.log, 1)
    yield delay(1000, console.log, 2)
    yield put({ type: 'CallSaga2' })
    console.log('[CallSaga is over]')
  }
  
  
  function* saga2() {
    yield take('CallSaga2')
    console.log('[CallSaga2 is over]')
  }
  
  function* saga3() {
    yield takeEvery('CallSaga3', subSaga)
  }
  
  function* subSaga() {
    console.log('---------------SUB_SAGE---------------')
  }
  
  runSaga(saga)
  runSaga(saga2)
  runSaga(saga3)

  
console.log('-----1------')
dispatch({
  type: 'CallSaga3',
  payload: {message: 'PUT DISPATCH1'}
})
dispatch({
  type: 'CallSaga3',
  payload: {message: 'PUT DISPATCH2'}
})
setTimeout(() => {
  dispatch({
    type: 'CallSaga3',
    payload: {message: 'PUT DISPATCH2'}
  })
  dispatch({
    type: 'CallSaga',
    payload: {message: 'PUT DISPATCH2'}
  })
}, 3000)