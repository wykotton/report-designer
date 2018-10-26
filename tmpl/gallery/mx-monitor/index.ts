/*
    author:xinglie.lkf@taobao.com
 */
let ICounter = 0;
let Instances = [];
let DocumentEvents = ['mousedown', 'keyup', 'touchstart', 'pointerstart'];
let Watcher = (e) => {
    for (let i = Instances.length; i--;) {
        let info = Instances[i];
        if (info['@{destroyed}']) {
            Instances.splice(i, 1);
        } else {
            let view = info['@{view}'];
            if (e.type == 'resize' || !view['@{inside}'](e.target)) {
                view['@{hide}']();
            }
        }
    }
};
let Remove = view => {
    let info = Instances[view.id];
    if (info) {
        info['@{destroyed}'] = true;
    }
    delete Instances[view.id];
};
export default {
    '@{add}'(view) {
        Remove(view);
        let info = {
            '@{view}': view
        };
        Instances.push(info);
        Instances[view.id] = info;
    },
    '@{remove}': Remove,
    '@{setup}'() {
        if (!ICounter) {
            for (let e of DocumentEvents) {
                document.addEventListener(e, Watcher);
            }
            window.addEventListener('resize', Watcher);
        }
        ICounter++;
    },
    '@{teardown}'() {
        if (ICounter > 0) {
            ICounter--;
            if (!ICounter) {
                for (let e of DocumentEvents) {
                    document.removeEventListener(e, Watcher);
                }
                window.removeEventListener('resize', Watcher);
            }
        }
    }
};