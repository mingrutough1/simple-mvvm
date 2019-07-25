
class Watcher { 
  constructor(vm, expr, cb) { 
    this.vm = vm;
    this.expr = expr;
    this.cb = cb;
    this.oldValue = this.get();
  }
  get() { 
    Dep.target = this;
    const value = this.getVal(this.vm, this.expr);
    Dep.target = null;
    return value;
  }
  getVal(vm, expr) { // 获取data选项中的数据
    let varArr = expr.split('.'); // 为了处理a.b.c的情况
    return varArr.reduce((pre, next) => { 
      return pre[next]
    }, vm.$data);
  }
  update() { 
    const newVal = this.getVal(this.vm, this.expr);

    this.cb(newVal);
  }
}



class Dep { 
  constructor() { 
    this.subs = [];
  }
  addSub(watcher) { 
    this.subs.push(watcher);
  }
  notify() { 
    this.subs.forEach(watcher => { 
      watcher.update();
    });
  }
}