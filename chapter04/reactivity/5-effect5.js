let activeEffect

const effect = (fn) => {
  activeEffect = fn
  fn()
}

// 存储副作用函数的桶
const bucket = new WeakMap()

const data = { text: 'hello' }
// 然后修改拦截器代码
const obj = new Proxy(data, {
  get(target, key) {
    // 没有 activeEffect，直接 return
    if (!activeEffect) {
      return
    }

    // 根据 target 从桶中取得 depsMap，它也是一个 Map 类型：key --> effects
    let depsMap = bucket.get(target)
    // 如果 depsMap 不存在，那么新建一个 Map 并与 target 关联
    if (!depsMap) {
      bucket.set(target, (depsMap = new Map()))
    }

    // 再根据 key 从 depsMap 中取得 deps，它是一个 Set 类型
    // 里面存储着所有与当前 key 相关联的副作用函数：effects
    let deps = depsMap.get(key)
    // 如果 deps 不存在，同样新建一个 Set 并与 key 关联
    if (!deps) {
      depsMap.set(key, (deps = new Set()))
    }

    // 最后将当前激活的副作用函数添加到桶中
    deps.add(activeEffect)

    // 返回属性值
    return target[key]
  },

  set(target, key, newValue) {
    // 设置属性值
    target[key] = newValue
    // 根据 target 从桶中取得 depsMap，它是 key --> effects
    const depsMap = bucket.get(target)
    if (!depsMap) {
      return
    }
    // 根据 key 取得所有副作用函数 effects
    const effects = depsMap.get(key)
    // 执行辅作用函数
    effects && effects.forEach(effect => effect())
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

/**
 * 我们修改 obj.text = 'hello vue3' 的时候可以发现页面的内容和 title 都会被修改为 'hello vue3'
 * 但是修改 obj.notExist = 'hello world' 时就不会再触发两个副作用函数执行了。
 */

/**
 * 这段代码构建的数据结构分别使用了 WeakMap、Map 和 Set
 * WeakMap 由 target --> Map 构成
 * Map 由 key --> Set 构成
 * 其中 WeakMap 的键是原始对象 target，WeakMap 的值是一个 Map 实例，
 * 而 Map 的键是原始对象 target 的 key，Map 的值是一个由副作用函数组成的 Set。
 */