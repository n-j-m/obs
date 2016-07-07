jest.unmock('../src/observable')
import { observe } from '../src/observable'

describe('observable', () => {
  let model = { a: 'b' }

  beforeEach(() => {
    model = { a: 'b' }
  })

  it('observable keys equal model keys', () => {
    const obs = observe(model, () => {})

    expect(Object.keys(model)).toEqual(Object.keys(obs))
  })

  it('should not call the given function since the value `a` is never read', () => {
    const mockFn = jest.fn()
    const obs = observe(model, mockFn)

    obs.a = 'c'

    expect(mockFn.mock.calls.length).toBe(0)
  })

  it('should call the given function when `a` is updated', () => {
    const mockFn = jest.fn()
    const obs = observe(model, mockFn)

    const a = obs.a
    obs.a = 'c'

    expect(mockFn.mock.calls.length).toBe(1)
  })

  it('should not call the given function when `a` is updated with the same value', () => {
    const mockFn = jest.fn()
    const obs = observe(model, mockFn)

    const a = obs.a
    obs.a = 'b'

    expect(mockFn.mock.calls.length).toBe(0)
  })

  describe('arrays', () => {
    let model = ['a']

    beforeEach(() => {
      model = ['a']
    })

    describe('push', () => {
      it('should call the given function when push is called', () => {
        const mockFn = jest.fn()
        const obs = observe(model, mockFn)

        obs.push('b')

        expect(mockFn.mock.calls.length).toBe(1)
      })

      it('should call the given function when a new item pushed into the array has been modified', () => {
        const mockFn = jest.fn()
        const obs = observe(model, mockFn)

        obs.push({b: 'c'})

        // read obs[1].b to subscribe it to the mock fn
        var b = obs[1].b
        obs[1].b = 'd'

        expect(mockFn.mock.calls.length).toBe(2)
      })
    })

    describe('pop', () => {
      it('should call the given function when pop is called', () => {
        const mockFn = jest.fn()
        const obs = observe(model, mockFn)

        obs.pop()

        expect(mockFn.mock.calls.length).toBe(1)
      })
    })

    describe('splice', () => {
      it('should call the given function when splice is called', () => {
        const mockFn = jest.fn()
        const obs = observe(model, mockFn)

        obs.splice(0, 1)

        expect(mockFn.mock.calls.length).toBe(1)
      })
      it('should call the given function when a new item that was spliced into the array is modified', () => {
        const mockFn = jest.fn()
        const obs = observe(model, mockFn)

        obs.splice(0, 1, {b: 'c'})

        // read obs[0].b to subscribe it to the mock fn
        var b = obs[0].b
        obs[0].b = 'd'

        expect(mockFn.mock.calls.length).toBe(2)
      })
    })

    describe('shift', () => {
      it('should call the given function when shift is called', () => {
        const mockFn = jest.fn()
        const obs = observe(model, mockFn)

        obs.shift()

        expect(mockFn.mock.calls.length).toBe(1)
      })
    })

    describe('unshift', () => {
      it('should call the given function when unshift is called', () => {
        const mockFn = jest.fn()
        const obs = observe(model, mockFn)

        obs.unshift('b')

        expect(mockFn.mock.calls.length).toBe(1)
      })

      it('should call the given function when a new item that was unshifted into the array is modified', () => {
        const mockFn = jest.fn()
        const obs = observe(model, mockFn)

        obs.unshift({b: 'c'})

        // read obs[0].b to subscribe it to the mock function
        var b = obs[0].b
        obs[0].b = 'd'

        expect(mockFn.mock.calls.length).toBe(2)
      })
    })

    describe('sort', () => {
      beforeEach(() => {
        model = [1, 2]
      })
      it('should call the function when the array is sorted', () => {
        const mockFn = jest.fn()
        const obs = observe(model, mockFn)

        obs.sort((a, b) => a < b)

        expect(mockFn.mock.calls.length).toBe(1)
        expect(obs).toEqual([2,1])
      })
    })

    describe('reverse', () => {
      beforeEach(() => {
        model = [1,2]
      })
      it('should call the function when the array is reversed', () => {
        const mockFn = jest.fn()
        const obs = observe(model, mockFn)

        obs.reverse()

        expect(mockFn.mock.calls.length).toBe(1)
        expect(obs).toEqual([2,1])
      })
    })

    describe('$set', () => {
      it('should call the function when an element is modified with $set', () => {
        const mockFn = jest.fn()
        const obs = observe(model, mockFn)

        obs.$set(0, 'c')

        expect(mockFn.mock.calls.length).toBe(1)
      })
      it('should not call the function when an element is modified via direct index', () => {
        const mockFn = jest.fn()
        const obs = observe(model, mockFn)

        obs[0] = 'c'

        expect(mockFn.mock.calls.length).toBe(0)
      })
    })

    describe('$remove', () => {
      it('should call the function when an element is removed with $remove', () => {
        const mockFn = jest.fn()
        const obs = observe(model, mockFn)

        obs.$remove(obs[0])

        expect(mockFn.mock.calls.length).toBe(1)
      })
    })

    describe('array of arrays', () => {
      beforeEach(() => {
        model = [[1, 2]]
      })
      it('should create an observable array item in the array', () => {
        const mockFn = jest.fn()
        const obs = observe(model, mockFn)

        obs[0].push(3)

        expect(mockFn.mock.calls.length).toBe(1)
        expect(obs[0]).toEqual([1,2,3])
      })
    })
  })

  describe('objects', () => {
    let model = { a: { b: 'c' } }

    beforeEach(() => {
      model = { a: { b: 'c' } }
    })

    it('should call the function when a property is modified', () => {
      const mockFn = jest.fn()
      const obs = observe(model, mockFn)

      // read property to subscribe to changes
      var a = obs.a
      obs.a = 'd'

      expect(mockFn.mock.calls.length).toBe(1)
    })

    it('should call the function when a child property is modified', () => {
      const mockFn = jest.fn()
      const obs = observe(model, mockFn)

      // read property to subscribe to changes
      var b = obs.a.b
      obs.a.b = 'd'

      expect(mockFn.mock.calls.length).toBe(1)
    })

    it('should not call the function when a child property is set with the same value', () => {
      const mockFn = jest.fn()
      const obs = observe(model, mockFn)

      // read the property to subscribe to changes
      var b = obs.a.b
      obs.a.b = 'c'

      expect(mockFn.mock.calls.length).toBe(0)
    })

    it('should not call the function when a newly added property is modified - property addition or deletion is not supported', () => {
      const mockFn = jest.fn()
      const obs = observe(model, mockFn)

      obs.d = 'e'
      var d = obs.d
      obs.d = 'f'

      expect(mockFn.mock.calls.length).toBe(0)
    })

    it('should make array properties observable', () => {
      const mockFn = jest.fn()
      const obs = observe({ a: [1, 2] }, mockFn)

      obs.a.push(3)

      expect(mockFn.mock.calls.length).toBe(1)
      expect(obs.a).toEqual([1,2,3])
    })
  })
})
