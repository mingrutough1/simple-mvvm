
class Mvvm {
  constructor(options) { 
    this.$el = options.el;
    this.$data = options.data;

    if (this.$el) { 
      new Observer(this.$data);   
      this.proxyData();   
      new Compile(this.$el, this);
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
    // 下面方法不行，它不能复制get和set。
    // Object.keys(data).forEach(key => {
    //   this[key]=data[key];
    // });
  }
};