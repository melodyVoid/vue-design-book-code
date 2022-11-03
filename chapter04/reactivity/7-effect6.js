let activeEffect

const effect = fn => {
  activeEffect = fn
  fn()
}

const bucket = new WeakMap()


const data = { text: 'hello' }

const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    // 将副作用函数的 activeEffect 添加到存储桶中
    track(target, key)
    return target[key]
  },

  // 拦截设置操作
  set(target, key, newValue) {
    // 设置属性值
    target[key] = newValue
    // 把副作用函数从桶里取出来并执行
    trigger(target, key)
  }
})

// 在 get 拦截函数内调用 track 函数追踪变化
function track(target, key) {
  // 没有 activeEffect，直接 return
  if (!activeEffect) {
    return
  }
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }

  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }

  deps.add(activeEffect)
}

// 在 set 拦截函数内调用 trigger 函数触发变化
function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) {
    return
  }
  const effects = depsMap.get(key)
  effects && effects.forEach(effect => effect())
}


effect(() => {
  // 一个匿名的副作用函数
  console.log('执行了修改 document.body.innerText')
  document.body.innerText = obj.text
})

effect(() => {
  console.log('执行了修改 document.title')
  document.title = obj.text
})