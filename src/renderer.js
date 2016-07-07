import { observe } from './observable'
import { makeThunk } from './thunk'
import { h as vdomh, diff, patch, create } from 'virtual-dom'

function executeComponent (component, props, children) {
  const thunk = makeThunk(component, props, children)
  if (props['key']) {
    thunk['key'] = props['key']
  }
  return thunk
}

export function h (selector, props, children) {
  if (selector.type === 'Thunk') {
    return selector
  }
  if (typeof selector === 'function') {
    return executeComponent(selector, props, children)
  }
  return vdomh(selector, props, children)
}

export function makeRenderer (component, mount) {
  let oldVNode = null
  let node = null

  function createNode (vNode) {
    node = create(vNode)
    mount.innerHTML = ''
    mount.appendChild(node)
    oldVNode = vNode
  }

  function updateNode (vNode) {
    const patches = diff(oldVNode, vNode)
    node = patch(node, patches)
    oldVNode = vNode
  }

  return function run (initialData) {
    function render () {
      const vNode = component(obs)
      if (node) {
        updateNode(vNode)
      } else {
        createNode(vNode)
      }
    }
    const obs = observe(initialData, render)
    render()
  }
}
