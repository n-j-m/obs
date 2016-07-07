import { makeRenderer, h } from './renderer'

function Counter (data) {
  return (
    <li>
      <h2>Count: {data.counter.count}</h2>
      <button onclick={() => data.counter.count--}>-</button>
      <button onclick={() => data.counter.count++}>+</button>
    </li>
  )
}

function CounterApp (data) {
  return (
    <div>
      <h1>Counters</h1>
      <button onclick={() => data.counters.push({ count: 0 })}>
        Add Counter
      </button>
      <ul>
        {data.counters.map((counter, i) => <Counter counter={counter} key={i} />)}
      </ul>
    </div>
  )
}

const exec = makeRenderer(CounterApp, document.getElementById('root'))

exec({ counters: [] })
