//#loader=none;
if (typeof DEBUG == 'undefined') DEBUG = true;
'@./lib/sea.js';
'@./lib/magix.ts';
let Designer = {
    init(ops) {
        let node = document.getElementById('boot') as HTMLScriptElement;
        let src = node.src.replace(/\/[^\/]+$/, '/');
        seajs.config({
            paths: {
                designer: src + 'designer',
                i18n: src + 'i18n',
                gallery: src + 'gallery',
                util: src + 'util',
                panels: src + 'panels',
                elements: src + 'elements'
            },
            alias: {
                magix: 'magix5'
            }
        });
        seajs.use([
            'magix',
            'i18n/index'
        ], (Magix: Magix5.Magix, I18n) => {
            Magix.applyStyle('@scoped.style');
            let lang = navigator.language.toLowerCase();
            try {
                let store = window.localStorage;
                if (store) {
                    lang = store.getItem('l.lang') || lang;
                }
            } catch{

            }
            Magix.config(ops);
            Magix.config({
                lang
            });
            let i18n = I18n.default;
            Magix.View.merge({
                ctor() {
                    this.set({
                        i18n
                    });
                },
                '@{throttle}'(fn, timespan) {
                    timespan = timespan || 150;
                    let last = Date.now();
                    let timer;
                    return (...args) => {
                        let now = Date.now();
                        clearTimeout(timer);
                        if (now - last > timespan) {
                            last = now;
                            fn.apply(this, args);
                        } else {
                            timer = setTimeout(() => {
                                fn.apply(this, args);
                            }, timespan - (now - last));
                        }
                    };
                }
            });
            document.title = i18n('@{lang#site.name}');
            Magix.boot({
                defaultPath: '/index',
                defaultView: 'designer/index',
                rootId: 'app',
                error(e: Error) {
                    setTimeout(() => {
                        throw e;
                    }, 0);
                }
            });
        });
    }
};