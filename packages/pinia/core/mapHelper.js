import { isFun, isStr } from "./utils"

let mapStoreSuffix = 'Store'
// 设置拼接后缀
export const setMapStoreSuffix = suffix => {
  if (isStr(suffix)) mapStoreSuffix = suffix
}

// https://pinia.vuejs.org/zh/api/modules/pinia.html#mapstores
export const mapStores = function (...stores) {
  // 参数兼容处理
  stores = Array.isArray(stores[0]) ? stores[0] : stores
  const storeMap = stores.reduce(function (memoStoreMap, useStore) {
    // PS: 在 createPinia 中已经注入 *.$pinia 的全局属性了
    const store = useStore(this.$pinia)
    memoStoreMap[`${store.$id}${mapStoreSuffix}`] = store
    return memoStoreMap
  }, {})
  return storeMap
}

// https://pinia.vuejs.org/zh/api/modules/pinia.html#mapstate
export const mapState = function (useStore, keyMapper) {
  if (Array.isArray(keyMapper)) {
    return keyMapper.reduce((reduce, name) => {
      reduce[name] = function () {
        const store = useStore(this.$pinia)
        return store[name]
      }
      return reduce
    }, {})
  } else {
    /**
     * keyMapper ==>
     * {
     *  renameA: 'a',
     *  b: (store) => store.b
     * }
     */
    return Object.entries(keyMapper || {}).reduce((reduce, [name, key]) => {
      reduce[name] = function () {
        const store = useStore(this.$pinia)
        if (isFun(key)) return key.call(this, store)
        if (isStr) return store[key]
      }
      return reduce
    }, {})
  }
}

// getters 的处理方式与 mapState 一样
// https://pinia.vuejs.org/zh/api/modules/pinia.html#mapgetters
export const mapGetters = mapState

// https://pinia.vuejs.org/zh/api/modules/pinia.html#mapactions
export const mapActions = function (useStore, keyMapper) {
  const isArray = Array.isArray(keyMapper)

  if (isArray) {
    return keyMapper.reduce((reduce, name) => {
      reduce[name] = function (...args) {
        const store = useStore(this.$pinia)
        return store[name].apply(store, args)
      }
      return reduce
    }, {})
  } else {
    return Object.entries(keyMapper).reduce((reduce, [rename, name]) => {
      reduce[rename] = function (...args) {
        const store = useStore(this.$pinia)
        return store[name].apply(store, args)
      }
      return reduce
    }, {})
  }
}

// 可读可写的高阶版本 mapState
// https://pinia.vuejs.org/zh/api/modules/pinia.html#mapwritablestate
export const mapWritableState = function (useStore, keyMapper) {
  const isArray = Array.isArray(keyMapper)
  if (isArray) {
    return keyMapper.reduce((reduce, name) => {
      reduce[name] = {
        get() {
          return useStore(this.$pinia)[name]
        },
        set(val) {
          return useStore(this.$pinia)[name] = val
        }
      }
      return reduce
    }, {})
  } else {
    return Object.entries(keyMapper).reduce((reduce, [rename, name]) => {
      reduce[rename] = {
        get() {
          let store = useStore(this.$pinia)
          if (isFun(name)) return name(store)
          return useStore(store)[name]
        },
        set(val) {
          return useStore(this.$pinia)[name] = val
        }
      }
      return reduce
    }, {})
  }
}
