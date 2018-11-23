/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix from 'magix';
Magix.applyStyle('@./style.less');
export default Magix.View.extend({
    tmpl: '@align.html',
    init(data) {
        this.assign(data);
    },
    assign(data) {
        this['@{current.value}'] = data.value;
        this.set({
            value: data.value,
            disabled: data.disabled
        });
        return true;
    },
    render() {
        this.digest();
    },
    '@{set}<click>'(e) {
        let me = this;
        if (me.get('disabled')) {
            return;
        }
        let value = me['@{current.value}'];
        let { type, v } = e.params;
        value[type] = v;
        me['@{current.value}'] = value;
        me.digest({
            value
        });
        Magix.dispatch(me.root, 'input', {
            value
        });
    }
});