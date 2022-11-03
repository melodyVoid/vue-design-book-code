let activeEffectFn

const effectStack = []
const effect = (fn) => {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffectFn = effectFn
    effectStack.push(effectFn)
    fn()
    effectStack.pop()
    activeEffectFn = effectStack[effectStack.length - 1]
  }
  effectFn.deps = []
  effectFn()
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
}

const bucket = new WeakMap()
const data = { ok: true, text: 'hello world'  }

const dataProxy = new Proxy(data, {
  get(target, key) {
    console.log(key, 'key')
    track(target, key)
    return target[key]
  },
  set(target, key, value) {
    target[key] = value
    trigger(target, key)
  }
})

function track(target, key) {
  if (!activeEffectFn) {
    return
  }
  let depsMap = bucket.get(target)
  console.log(depsMap, 'depsMap', key)
  if (!depsMap) {
    depsMap = new Map()
    bucket.set(target, depsMap)
  }
  let deps = depsMap.get(key)
  if (!deps) {
    deps = new Set()
    depsMap.set(key, deps)
  }
  deps.add(activeEffectFn)

  activeEffectFn.deps.push(deps)
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) {
    return
  }
  const effects = depsMap.get(key)
  const effectsToRun = new Set(effects)
  effectsToRun.forEach(effect => effect())
}
// console.log(obj.ok)
effect(() => {
  // console.log(bucket)
  console.log('修改了文档')
  document.body.innerHTML = dataProxy.ok ? dataProxy.text : 'not'
})
effect(() => {
  console.log('修改了 title')
  document.title = dataProxy.text
})