// 基础变量
export const piniaSymbol = Symbol('piniaSymbol')
export let activePinia = null

// 设置当前正在使用的 pinia 实例
export const setActivePinia = pinia => activePinia = pinia

// 获取当前正在使用的 pinia 实例
export const getActivePinia = () => activePinia