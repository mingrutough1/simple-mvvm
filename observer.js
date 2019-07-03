class Observer { 
  constructor(data) {
    this.obeserve(data);
  }
  obeserve(data) { 
    if (!data || typeof data !== 'object') { 
      return;
    }
    // 数据劫持
    Object.keys(data).forEach((key) => { 
      this.defineReactive(data, key, data[key]);
      this.obeserve(data[key]);
    });
  }
  defineReactive(obj, key, value) {
    const self = this;
    let dep = new Dep(); // 对于每一个属性都new一个Dep对象
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() { 
        Dep.target&&dep.addSub(Dep.target); // 充分利用js的单线程特点
        return value;
      },
      set(newValue) { 
        if (newValue !== value) { 
          value = newValue;
          self.obeserve(value);// 如果新值是对象，继续劫持
          dep.notify();
        }
      }
    });
  }
}