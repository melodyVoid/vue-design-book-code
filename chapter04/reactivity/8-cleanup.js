let activeEffect

const effect = fn => {
  activeEffect = fn
  fn()
}

const bucket = new WeakMap()

const data = { ok: true, text: 'hello' }

const obj = new Proxy(data, {
  get(target, key) {
    track(target, key)
    return target[key]
  },
  set(target, key, newValue) {
    target[key] = newValue
    trigger(target, key)
  }
})

function track(target, key) {
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


function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) {
    return
  }
  const effects = depsMap.get(key)
  effects && effects.forEach(effect => effect())
}


effect(() => {
  console.log('副作用执行')
  document.body.innerText = obj.ok ? obj.text : 'not'
})

/**
 * 执行 obj.text = 'hello vue3' 时，副作用函数会执行，同时更新 innerText
 * 然后把 obj.ok 改为 false
 * 再执行 obj.text = '11111'，会发现 innerText 没有更新，但是副作用函数还是执行了，这是不合理的
 * 我们期望的是 obj.ok 为 false 的时候，不再收集 obj.text 的依赖
 */

/**
 * 解决这个问题的思路很简单：
 * 每次副作用函数执行时，我们可以先把它从所有与之关联的依赖集合中删除
 */