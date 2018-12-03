/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix from 'magix';
Magix.applyStyle('@style.less');
export default Magix.View.extend({
    tmpl: '@style.html',
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
        let v = me['@{current.value}'];
        let { key } = e.params;
        v[key] = !v[key];
        me['@{current.value}'] = v;
        me.digest({
            value: v
        });
        Magix.dispatch(me.root, 'input', {
            value: v
        });
    }
});