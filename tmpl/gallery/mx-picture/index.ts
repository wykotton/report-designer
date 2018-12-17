/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { node } from 'magix';
import Dialog from '../mx-dialog/index';
Magix.applyStyle('@index.less');
export default Magix.View.extend({
    tmpl: '@index.html',
    mixins: [Dialog],
    init(data) {
        this.assign(data);
    },
    assign(data) {
        this.set(data);
        return true;
    },
    render() {
        this.digest();
    },
    '@{choose.picture}<click>'() {
        let me = this;
        me.mxDialog('@./list', {
            width: 932,
            done(pic) {
                me.digest(pic);
                me['@{fire.event}'](pic);
            }
        });
    },
    '@{fire.event}'(pic) {
        Magix.dispatch(this.root, 'change', pic);
    },
    '@{clear.image}<click>'(e: Magix5.MagixMouseEvent) {
        e.stopPropagation();
        this.digest({
            src: ''
        });
        this['@{fire.event}']({
            src: '',
            width: 0,
            height: 0
        });
    }
});