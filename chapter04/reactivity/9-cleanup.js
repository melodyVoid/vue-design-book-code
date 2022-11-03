// 用一个全局变量存储被注册的副作用函数
let activeEffect

const effect = fn => {
  const effectFn = () => {
    // 当 effect 执行时，将其设置为当前激活的副作用函数
    activeEffect = effectFn
    fn()
  }

  // activeEffect.deps 用来存储所有与该副作用函数相关联的依赖集合
  effectFn.deps = []
  // 执行副作用函数
  effectFn()
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
  // 没有 activeEffect，直接 return
  if (!activeEffect) {
    return
  }

  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.get(target, (depsMap = new Map()))
  }

  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }

  // ** 把当前激活的副作用函数添加到依赖集合 deps 中 **
  deps.add(activeEffect)

  // deps 就是一个与当前副作用函数存在联系的依赖集合
  // ** 将其添加到 activeEffective.deps 数组中 **
  activeEffect.deps.push(deps)
}