const { random } = Math
// 定义内部 Action
const IDENITY = random().toString(16).substring(5)
export default {
  INIT: `@@INIT_${IDENITY}`,
  REPLACE: `@@REPLACE_${IDENITY}`,
}