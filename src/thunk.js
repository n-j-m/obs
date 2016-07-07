
class Thunk {
  constructor (renderer, state, children) {
    this.type = 'Thunk'
    this.renderer = renderer
    this.state = state
    this.children
  }

  render (previous) {
    if (previous && previous.state === this.state) {
      return previous
    }
    return this.renderer(this.state, this.children)
  }
}

export function makeThunk (component, props, children) {
  return new Thunk(component, props, children)
}