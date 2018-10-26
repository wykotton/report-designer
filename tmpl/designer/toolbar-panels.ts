/*
    author:xinglie.lkf@alibaba-inc.com
*/
'ref@./toolbar.less';
import Magix from 'magix';
import Panels from '../panels/index';
export default Magix.View.extend({
    tmpl: '@toolbar-panels.html',
    init() {
        Panels.on('change', () => {
            console.log('change');
            this.render();
        });
    },
    render() {
        this.digest({
            panels: Panels["@{support.panels}"]()
        });
    },
    '@{toggle.panel}<click>'(e) {
        let { id } = e.params;
        Panels["@{toggle.panel}"](id);
    }
});