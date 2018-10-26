/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix from 'magix';
import Panels from '../panels/index';
import Dialog from '../gallery/mx-dialog/index';
Magix.applyStyle('@index.less');
export default Magix.View.extend({
    tmpl: '@index.html',
    mixins: [Dialog],
    render() {
        this.digest(null, null, () => {
            Panels["@{open.panels}"]();
        });
        //this.mxDialog('@./toolbar-panels');
    }
});