class Compile {
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el);
    this.vm = vm;

    if (this.el) {
      // 将dom操作放到fragment中。
      let fragment = this.node2fragment(this.el);
      // 编译得到v-model 以及 {{}}
      this.compile(fragment);
      this.el.appendChild(fragment);      
    }
  }

  // 核心方法
  compileElement(node) { // 处理v-model等指令
    let attributes = node.attributes;
    Array.from(attributes).forEach((attr) => { 
      // 判读attr.name是否是指令
      if (this.isDirective(attr.name)) { 
        //取到对应的值放到节点中
        let expr = attr.value;
        let [, type] = attr.name.split('-');
        CompileUtils[type](node, this.vm, expr);
      }
    });
  }
  compileText(node) { // 处理{{}}
    let text = node.textContent; // 
    let reg = /\{\{([^{]+)\}\}/g; // 注意{{a}} {{b}}这种情况
    if (reg.test(text)) { 
      CompileUtils['text'](node, this.vm, text);
    }
  }
  compile(fragment) {
    let childNodes = fragment.childNodes; //只能拿到第一层的，需要递归
    Array.from(childNodes).forEach((node) => {
      if (this.isElementNode(node)) { // 元素节点
        this.compileElement(node);
        this.compile(node);
      } else if (this.isTextNode(node)) { // 文本节点
        this.compileText(node);
      }
    });
  }
  node2fragment(el) {
    let fragment = document.createDocumentFragment();
    while (el.firstChild) {
      fragment.appendChild(el.firstChild); // appendChild方法是移动节点，所以直到el.firstChild为空，而遍历完el的子节点
    }
    return fragment;
  }
  //辅助方法
  isDirective(name) { 
    return /^v-/.test(name);
  }
  isElementNode(node) { // 是否是元素节点
    return node.nodeType === 1;
  }
  isTextNode(node) { // 是否是文本节点
    return node.nodeType === 3;
  }
}

// 涉及到编译部分的一些公共方法
CompileUtils = {
  getVal(vm, expr) { // 获取data选项中的数据
    let varArr = expr.split('.'); // 为了处理a.b.c的情况
    return varArr.reduce((pre, next) => { 
      return pre[next]
    }, vm.$data);
  },
  getTextVal(vm, expr) { 
    return expr.replace(/\{\{([^{]+)\}\}/g, (...arguments) => { // 对于 {{fa}} 相当于arguments[0]是匹配到了{{fa}},arguments[1]组匹配1:fa,
       return this.getVal(vm, arguments[1]);
    });
  },
  text(node, vm, expr) { // 文本处理
    let updateFn = this.updater['textUpdater'];
    // 监控应该加载这里
    expr.replace(/\{\{([^{]+)\}\}/g, (...arguments) => { // 
      new Watcher(vm, arguments[1], (newValue) => { //监控多个{{}} 中的值
        updateFn && updateFn(node, this.getTextVal(vm, expr));      
      })   
    });
    updateFn && updateFn(node, this.getTextVal(vm, expr));
  },
  model(node, vm, expr) { // 输入框处理
    let updateFn = this.updater['modelUpdater'];
    // 监控应该加载这里
    new Watcher(vm, expr, (newValue) => { 
      updateFn && updateFn(node, newValue);      
    })    
    node.addEventListener('input', (e) => { 
      let newValue = e.target.value;
      this.setValue(vm, expr, newValue);
    });
    updateFn && updateFn(node, this.getVal(vm, expr));
  },
  setValue(vm, expr, newValue) { 
    let varArr = expr.split('.'); // 为了处理a.b.c的情况
    return varArr.reduce((pre, next, index) => { 
      if (index === varArr.length - 1) { 
        return pre[next] = newValue;
      }
      return pre[next]
    }, vm.$data);
  },
  updater: {
    textUpdater(node, value) { // 文本更新
      node.textContent = value;
    },
    modelUpdater(node, value) { // 输入框更新
      node.value = value;
     }  
  },
};