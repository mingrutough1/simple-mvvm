let callbacks = []; // 用来存储传入nextTick的cb。
let pending = false; // 保证同时调用多个nextTick的cb在下一个tick执行。

function nextTick (cb) {
    callbacks.push(cb);

    if (!pending) {
        pending = true;
        setTimeout(flushCallbacks, 0);
    }
}

function flushCallbacks () {
    pending = false;
    const copies = callbacks.slice(0);
    callbacks.length = 0;
    for (let i = 0; i < copies.length; i++) {
        copies[i]();
    }
}


let uid = 0;

class Watcher {
    constructor () {
        this.id = ++uid;
    }

    update () {
        console.log('watch' + this.id + ' update');
        queueWatcher(this);
    }

    run () {
        console.log('watch' + this.id + '视图更新啦～');
    }
}

let has = {};
let queue = [];
let waiting = false;

function queueWatcher(watcher) {
    const id = watcher.id;
    if (has[id] == null) {
        has[id] = true;
        queue.push(watcher);

        if (!waiting) {
            waiting = true;
            nextTick(flushSchedulerQueue);
        }
    }
}