/**
 * 从上个例子中我们可以看出，一个响应式系统的工作流程如下：
 * 1. 当读取操作发生时，将副作用函数收集到存储桶中
 * 2. 当设置操作发生时，从存储桶中取出副作用函数并执行
 */

// 上一节我们将 effect 写死了，但是我们期望的是：哪怕副作用函数是匿名函数，也能够被收集到存储桶中。
// 为了实现这一点，我们需要提供一个用来注册副作用函数的机制

// 定义一个全局变量用来存储被注册的副作用函数
let activeEffect

// effect 函数用于注册副作用函数
function effect(fn) {
  // 当调用 effect 注册副作用函数时，将副作用函数 fn 赋值给 activeEffect
  activeEffect = fn
  // 执行副作用函数
  fn()
}

const bucket = new Set()

const data = { text: 'hello' }

const obj = new Proxy(data, {
  get(target, key) {
    // 将 activeEffect 中存储的副作用函数收集到存储桶中
    if (activeEffect) {
      bucket.add(activeEffect)
    }
    return target[key]
  },
  set(target, key, newValue) {
    target[key] = newValue
    console.log(bucket)
    bucket.forEach(effect => effect())
    return true
  }
})

effect(() => {
  // 一个匿名的副作用函数
  console.log('执行了修改 document.body.innerText')
  document.body.innerText = obj.text
})

effect(() => {
  console.log('执行了修改 document.title')
  document.title = obj.text
})

// 我们修改 obj.text = 'hello vue3' 的时候可以发现页面的内容和 title 都会被修改为 'hello vue3'

/**
 * 还有其他问题吗？当然
 * 我们尝试一下修改 obj 中不存在的属性，obj.notExist = 'hello world'
 * 我们发现两个副作用函数依然会执行！这显然是不合理的。
 * 为了解决这个问题，我们需要重新设计存储桶的数据结构。
 */