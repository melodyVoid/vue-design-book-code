const obj = { text: 'hello' }

const effect = () => {
  // effect 的执行会读取 obj.text
  document.body.innerText = obj.text
}

effect()

// 期望：修改 obj.text 的值时，document.body.innerText 会同步更新（响应）
// 也就是需要 effect() 重新执行

