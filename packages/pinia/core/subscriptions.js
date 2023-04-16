import { getCurrentScope, onScopeDispose } from "vue"
/**
 * 添加订阅函数
 * @param {array} subscriptions 指定订阅队列
 * @param {function} callback 订阅函数
 * @param {boolean} detached 组件上下文分离（组件卸载不随着注销）
 * @param {function} onCleaned 
 * @returns 
 */
export function addSubscription(subscriptions, callback, detached, onCleaned) {
  subscriptions.push(callback)
  // 封装注销函数
  const removeSubscription = () => {
    const pos = subscriptions.indexOf(callback)
    if (pos != -1) {
      subscriptions.splice(pos, 1)
      onCleaned?.()
    }
  }

  if (!detached && getCurrentScope()) {
    onScopeDispose(removeSubscription)
  }

  return removeSubscription
}

// 触发订阅函数
export function triggerSubscriptions(subscriptions, ...args) {
  [...subscriptions].forEach(callback => callback(...args))
}
