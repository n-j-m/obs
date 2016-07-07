export const PubSub = {
  channels: new WeakMap(),
  
  subscribe (key, listener) {
    if (!this.channels.has(key)) {
      this.channels.set(key, [])
    }
    const channel = this.channels.get(key)
    
    if (channel.indexOf(listener) === -1) {
      channel.push(listener)
    }
    
    return () => channel.splice(channel.indexOf(listener), 1)
  },
  
  notify (key, old, value, target, source, prop) {
    if (this.channels.has(key) && old !== value) {
      this.channels.get(key).forEach(l => l(old, value, target, source, prop, key))
    }
  }
}

const arrayMethods = ['push', 'pop', 'splice', 'shift', 'unshift', 'sort', 'reverse']

function cloneArray (arr) {
  return Array.prototype.slice.call(arr, 0)
}

function augmentArray (arr, consumer, context) {
  arrayMethods.forEach(method => {
    const origMethod = arr[method]
    switch (method) {
      case 'push':
      case 'unshift':
        def (arr, method, function (...args) {
          const old = cloneArray(arr)
          const values = args.reduce((newArr, item) => {
            if (Array.isArray(item) || (item && typeof item === 'object')) {
              newArr.push(observe(item, consumer, context || newArr))
            } else {
              newArr.push(item)
            }
            return newArr
          }, [])
          const ret = origMethod.apply(arr, values)
          PubSub.notify(context || arr, old, arr, arr, arr, ret)
          return ret
        }) 
        break
      case 'splice':
        def(arr, method, function (index, ...args) {
          const old = cloneArray(arr)
          const values = args.reduce((newArr, item) => {
            if (Array.isArray(item) || (item && typeof item === 'object')) {
              newArr.push(observe(item, consumer, context || newArr))
            } else {
              newArr.push(item)
            }
            return newArr
          }, [])
          const ret = origMethod.apply(arr, [index].concat(values))
          PubSub.notify(context || arr, old, arr, arr, arr, ret)
          return ret
        }) 
        break
      default:
        def(arr, method, function (...args) {
          const old = cloneArray(arr)
          const ret = origMethod.apply(arr, args)
          PubSub.notify(context || arr, old, arr, arr, arr, ret)
          return ret
        })
        break 
    }
  })
  def(arr, '$set', function $set (index, value) {
    const old = this[index]
    this[index] = value
    PubSub.notify(context || arr, old, arr, arr, arr, index)
  })
  def(arr, '$remove', function $remove (item) {
    const index = this.indexOf(item)
    if (index >= 0) {
      this.splice(index, 1)
    }
  }) 
  PubSub.subscribe(context || arr, consumer)
}

function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

function defineReactive (target, source, prop, consumer, context) {
  const desc = Object.getOwnPropertyDescriptor(source, prop)
  const getter = desc.get || function () { return source[prop] }
  const setter = desc.set || function (val) { source[prop] = val }
  
  let isSubscribed = false
  
  Object.defineProperty(target, prop, {
    enumerable: true,
    configurable: true,
    get () {
      if (!isSubscribed) {
        PubSub.subscribe(context || target, consumer)
        isSubscribed = true
      }
      return getter()
    },
    set (value) {
      const old = getter()
      if (value && typeof value === 'object') {
        setter(observe(value, consumer, context || target))
      } else {
        setter(value)
      }
      if (isSubscribed) {
        PubSub.notify(context || target, old, value, target, source, prop)
      }
    }
  })
}

function markObservable (obs) {
  def(obs, '__obs__', true)
}

export function observe (source, consumer, context) {
  if (source.__obs__) {
    return source
  }
  if (Array.isArray(source)) {
    const newArr = source.reduce((target, item) => {
      if (Array.isArray(item) || (item && typeof item === 'object')) {
        target.push(observe(item, consumer, context || target))
      } else {
        target.push(item)
      }
      return target
    }, [])
    augmentArray(newArr, consumer, context || newArr)
    markObservable(newArr)
    return newArr
  }
  
  const obs = Object.keys(source).reduce((target, key) => {
    if (Array.isArray(source[key])) {
      defineReactive(target, source, key, consumer)
      target[key] = observe(source[key], consumer, context || target)
      return target
    }
    if (source[key] && typeof source[key] === 'object') {
      defineReactive(target, source, key, consumer)
      target[key] = observe(source[key], consumer, context || target)
      return target
    }
    
    defineReactive(target, source, key, consumer, context || target)
    
    return target
  }, {})

  markObservable(obs)
  return obs
}
