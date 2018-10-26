/*
    author:xinglie.lkf@taobao.com
 */
import Magix from 'magix';
import I18n from '../../i18n/index';
export default Magix.View.extend({
    tmpl: '@alert.html',
    init(extra) {
        let me = this;
        me['@{dialog}'] = extra.dialog;
        me['@{string.body}'] = extra.body;
        me['@{string.title}'] = extra.title || I18n('@{lang#dialog.tip}');
        me['@{fn.enter.callback}'] = extra.enterCallback;
    },
    render() {
        let me = this;
        me.digest({
            body: me['@{string.body}'],
            title: me['@{string.title}']
        });
    },
    '@{enter}<click>'() {
        let me = this;
        me['@{dialog}'].close();
        if (me['@{fn.enter.callback}']) {
            Magix.toTry(me['@{fn.enter.callback}']);
        }
    }
});