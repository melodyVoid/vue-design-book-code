/**
 * 上个例子中，我们使用了一个 Set 数据结构作为存储副作用的桶。
 * 导致副作用函数被重复执行的根本原因是：没有在副作用函数与被操作的目标字段之间建立明确的关联关系。
 * 所以就会导致无论读取哪个属性都会把副作用收集到存储桶中，无论设置哪个属性都会把存储桶中的副作用函数取出并执行。
 * 副作用函数与被操作的字段之间没有明确的联系。
 * 我们需要重新设计存储桶的数据结构。
 */

// 应该怎么设计怎样的数据结构呢？我们先观察一下下面的代码

effect(function effectFn() {
  document.body.innerText = obj.text
})

/**
 * 这段代码中存在三个角色：
 * 1. 被操作（读取）的代理对象 obj
 * 2. 被操作（读取）的字段名 text
 * 3. 使用 effect 函数注册的副作用函数 effectFn
 */

/**
 * target
 *    └── key
 *         └── effectFn
 */

// ---------------------

// 如果有两个副作用函数同时读取同一个对象的属性值：

effect(function effectFn1() {
  obj.text
})

effect(function effectFn2() {
  obj.text
})

// 那么关系如下
/**
 * obj
 *  └── text
 *       └── effectFn1
 *       └── effectFn2
 */

// ------

// 如果同一个副作用函数读取了同一个对象中的两个不同的属性

effect(function effectFn() {
  obj.text1
  obj.text2
})

// 那么关系如下：

/**
 * obj
 *  └── text1
 *        └── effectFn
 *  └── text2
 *        └── effectFn
 */

// --------

// 如果在不同的副作用函数中读取了两个不同对象的不同的属性

effect(function effectFn1() {
  obj1.text1
})

effect(function effectFn2() {
  obj2.text2
})

// 那么关系如下：

/**
 * obj1
 *  └── text1
 *        └── effectFn1
 * obj2
 *  └── text2
 *        └── effectFn2
 */