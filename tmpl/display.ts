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
                gallery: src + 'gallery',
                elements: src + 'elements'
            },
            alias: {
                magix: 'magix5'
            }
        });
        seajs.use('magix5', (Magix: Magix5.Magix) => {
            Magix.applyStyle('@scoped.style');
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