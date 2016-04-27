import Observer from './Observer';

const noop = ()=>{};

export default class Observable {
  constructor(subscribe) {
    this._subscribe = subscribe || noop;
  }

  subscribe(observer) {
    const sub = this._subscribe(new Observer(observer));

    return sub;
  }

  map(transform) {
    return new MappedObservable(transform, this);
  }

  merge(...obs) {
    return new MergedObservable(this, ...obs);
  }

  static create(subscribe) {
    return new Observable(subscribe);
  }

  static interval(period) {
    return Observable.create(o => {
      let index = 0;

      const timer = setInterval(() => {
        o.next(index++)
      }, period)
    })
  }

  static from(arrLike) {
    if (!Array.isArray(arrLike)) {
      arrLike = Array.from(arrLike);
    }

    return Observable.create(o => {
      for(var i = 0, l = arrLike.length; i < l; i++) {
        o.next(arrLike[i]);
      }
      o.complete();
    });
  }

  static fromEvent(eventName, element) {
    return Observable.create(o => {
      function n(ev) {
        o.next(ev);
      }

      element.addEventListener(eventName, n)

      return () => element.removeEventListener('eventName', n);
    });
  }
}

class MappedObservable extends Observable {
  constructor(transform, parent) {
    super(parent._subscribe);
    this.transform = transform;
  }

  subscribe(observer) {
    const transform = this.transform;
    const mapped = new Observer({
      next(...values) {
        return observer.next(transform(...values))
      },
      error(err) {
        observer.error(err);
      },
      complete() {
        observer.complete();
      }
    });

    return this._subscribe(mapped);
  }
}

class MergedObservable extends Observable {
  constructor(...observables) {
    super(observables[0]._subscribe);
    this.observables = observables;
  }

  subscribe(observer) {
    this.observables.forEach(o => {
      console.log(o.subscribe)
      o.subscribe(observer)
    });
  }
}