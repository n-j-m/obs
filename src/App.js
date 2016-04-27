function isPrimitive(val) {
  const t = typeof val;
  return t === 'string' || t === 'number' || t === 'boolean';
}
export function el(tagName, ...args) {
  const element = document.createElement(tagName);

  for(let i = 0, l = args.length; i < l; i++) {
    const arg = args[i];

    if (mount(element, arg)) {
      continue;
    }
    else if (isPrimitive(arg)) {
      element.appendChild(document.createTextNode(arg));
    }
    else if (arg && typeof arg === 'object') {
      for (let attr in arg) {
        if (element[attr]) {
          element[attr] = arg[attr];
        }
        else {
          element.setAttribute(attr, arg[attr]);
        }
      }
    }
  }

  return element;
}

export function mount(parent, child) {
  const parentEl = parent.el || parent;
  const childEl = child.el || child;

  if (childEl instanceof Node) {
    parentEl.appendChild(childEl);
  }
  else if (isPrimitive(childEl)) {
    mount(parentEl, document.createTextNode(childEl));
  }
  else if (childEl instanceof Array) {
    for (let i = 0, l = childEl.length; i < l; i++) {
      mount(parentEl, childEl[i]);
    }
  }
  else {
    return false;
  }

  return true;
}

export default function App(name) {
  this.el = el('div',
    el('h1', 'Hello, ', this.name = document.createTextNode(name)),
    this.input = el('input', { type: 'text', value: name, placeholder: 'who are you?' })
  )
}

App.prototype.update = function update(name) {
  this.name.textContent = name;
}