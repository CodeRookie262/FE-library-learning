class StdChannel {
  channelList = []
  take(effectType, effect) {
    if (this.channelList.includes(effect)) return console.log('warn')
    effect.effectType = effectType
    effect.cancel = () => {
      this.channelList = this.channelList.filter(cb => cb !== effect)
    }
    this.channelList.push(effect)
  }
  put(action) {
    // 防止数组崩塌
    const effects = [...this.channelList].filter(effect => effect.effectType === action.type)
    effects.forEach(effect => {
      effect.cancel()
      // 提前清空掉
      effect(action)
    })
  }
}

export default new StdChannel

export {
  StdChannel
}