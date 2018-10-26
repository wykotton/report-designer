//#loader=none;
if (typeof DEBUG == 'undefined') DEBUG = true;
'@./lib/sea.js';
'@./lib/magix.js';
setTimeout(() => {
    let node = document.getElementById('boot') as HTMLScriptElement;
    let src = node.src.replace('/report.js', '');
    seajs.config({
        paths: {
            designer: src + '/designer',
            i18n: src + '/i18n',
            gallery: src + '/gallery',
            panels: src + '/panels'
        }
    });
    seajs.use([
        'magix',
        'i18n/index'
    ], (Magix: Magix, I18n) => {
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
        Magix.View.merge({
            ctor() {
                this.set({
                    i18n
                });
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
}, 0);