import { FORK, PUT, TAKE } from './constants'

const SagaWrap = (effectType, config) => Object.assign({effectType, ...config})

const take = (actionType) => SagaWrap(TAKE, {actionType})

const put = (action) => SagaWrap(PUT, {action})

const fork = (effect) => SagaWrap(FORK, {effect})

const takeEvery = (actionType, effect) => {
    function* takeEveryHelper () {
        while (true) {
            yield take(actionType)
            yield fork(effect)
        }
    }
    return fork(takeEveryHelper)
}

export {
    take,
    takeEvery,
    put,
    fork
}