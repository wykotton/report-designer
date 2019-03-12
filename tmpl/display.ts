//#loader=none;
if (typeof DEBUG == 'undefined') DEBUG = true;
'@./lib/sea.js';
'@./lib/magix.js';
let Designer = {
    init(ops) {
        let node = document.getElementById('boot') as HTMLScriptElement;
        let src = node.src.replace(/\/[^\/]+$/, '/');
        seajs.config({
            paths: {
                display: src + 'display',
                elements: src + 'elements',
                i18n: src + 'i18n'
            },
            alias: {
                magix: 'magix5'
            }
        });
        seajs.use(['magix5', 'i18n/index'], (Magix: Magix5.Magix, I18n) => {
            Magix.applyStyle('@scoped.style');
            let lang = 'zh-cn';
            try {
                let store = window.localStorage;
                if (store) {
                    lang = store.getItem('l.report.lang') || lang;
                }
            } catch{

            }
            Magix.config({
                lang
            });
            let i18n = I18n.default;
            document.title = i18n('@{lang#site.name}');
            Magix.View.merge({
                ctor() {
                    this.set({
                        i18n
                    });
                }
            });
            Magix.boot({
                defaultPath: '/index',
                defaultView: 'display/index',
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