// 用一个全局变量存储被注册的副作用函数
let activeEffect

const effect = fn => {
  const effectFn = () => {
    // 调用 cleanup 函数完成清除工作
    cleanup(effectFn)
    // 当 effect 执行时，将其设置为当前激活的副作用函数
    activeEffect = effectFn
    fn()
  }

  // activeEffect.deps 用来存储所有与该副作用函数相关联的依赖集合
  effectFn.deps = []
  // 执行副作用函数
  effectFn()
}

function cleanup(effectFn) {
  // 遍历 effectFn.deps 数组
  for (let i = 0; i < effectFn.deps.length; i++) {
    // deps 是依赖集合
    const deps = effectFn.deps[i]
    // 将 effectFn 从依赖集合中移除
    deps.delete(effectFn)
  }
  // 最后需要重置 effectFn.deps 数组
  effectFn.deps.length = 0
}

const bucket = new WeakMap()

const data = { foo: true, bar: true }

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
    bucket.set(target, (depsMap = new Map()))
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

function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) {
    return
  }
  const effects = depsMap.get(key)

  // 复制一份，防止死循环
  const effectsToRun = new Set(effects)
  effectsToRun.forEach(effect => effect())
}

// 全局变量 temp1、temp2
let temp1, temp2

effect(function effectFn1() {
  console.log('effectFn1 执行')

  effect(function effectFn2() {
    console.log('effectFn2 执行')
    // 在 effectFn2 中读取 obj.bar 属性
    temp2 = obj.bar
  })

  // 在 effectFn1 中读取 obj.foo 属性
  temp1 = obj.foo
})

obj.foo = 'xxx' 