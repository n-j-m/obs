const noop = ()=>{};
export default class Observer {
  constructor(sub) {
    this._n = sub.next || noop;
    this._e = sub.error || noop;
    this._c = sub.complete || noop;
  }

  next(...values) {
    this._n(...values)
  }
  error(err) {
    this._e(err);
  }
  complete() {
    this._c();
  }
}