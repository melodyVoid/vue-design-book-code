/**
 * 观察发现：
 * 1. 当副作用函数 effect 执行时，会触发字段 obj.text 的读取操作（get）
 * 2. 当修改 obj.text 的值时，会触发字段 obj.text 的设置操作 (set)
 * 那么是不是可以在 get 时我们把副作用函数存储起来，然后 set 的时候再将副作用函数执行一下就好了？
 */

// 存储副作用函数的桶
const bucket = new Set()

// 原始数据
const data = { text: 'hello' }

// 副作用函数
const effect = () => {
  document.body.innerText = obj.text
}

// 对原始数据的代理
const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    // 将副作用函数添加到存储桶中
    bucket.add(effect)
    return target[key]
  },
  // 拦截设置操作
  set(target, key, newValue) {
    // 设置属性值
    target[key] = newValue
    // 把副作用从桶中读取并执行
    bucket.forEach(effect => effect())
    // 返回 true 代表设置操作成功
    return true
  }
})

// 执行副作用函数，触发读取操作
effect()

// 1 秒后修改响应式数据
setTimeout(() => {
  obj.text = 'hello vue3'
}, 3000)