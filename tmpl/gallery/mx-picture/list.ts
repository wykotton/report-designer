/*
    author:xinglie.lkf@alibaba-inc.com
*/
'ref@./index.less';
import Magix from 'magix';
import Service from '../../designer/service';
import I18n from '../../i18n/index';
export default Magix.View.extend({
    mixins: [Service],
    tmpl: '@list.html',
    init(data) {
        let me = this;
        me['@{dialog}'] = data.dialog;
        me['@{done.callback}'] = data.done;
    },
    render() {
        this.fetch(['@{get.background.images}'], (err, bag) => {
            this.digest({
                error: err,
                list: bag.get('data', [])
            })
        });
    },
    '@{use}<click>'(e) {
        let me = this;
        let img = new Image();
        let done = me['@{done.callback}'];
        let src = e.params.src;
        img.onerror = me.wrapAsync(() => {
            me.alert(I18n('@{lang#load.img.error}'));
        });
        img.onload = me.wrapAsync(() => {
            let w = img.width;
            let h = img.height;
            me['@{dialog}'].close();
            done({
                src,
                width: w,
                height: h
            });
        });
        img.src = src;
    }
});