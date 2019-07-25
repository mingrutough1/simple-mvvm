
class Mvvm {
  constructor(options) { 
    this.$el = options.el;
    this.$data = options.data;

    if (this.$el) { 
      new Observer(this.$data);   
      new Compile(this.$el, this);
      this.proxyData();   
    }
  }
  proxyData() {
    const data = this.$data;
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        get() {
          return data[key];
        },
        set(newvalue) {
          data[key] = newvalue;
        }
      });
    });
  }
};