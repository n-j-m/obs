import Observable from './Observable';

const move = Observable.fromEvent('mousemove', document)
  .map(ev => ev.type);

const click = Observable.fromEvent('click', document)
  .map(ev => ev.type);

const obs = move.merge(click);

obs.subscribe({
  next(x) {
    console.log(x);
  }
});