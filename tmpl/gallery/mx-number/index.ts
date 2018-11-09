/*
    author:xinglie.lkf@alibaba-inc.com
 */
import Magix, { node } from 'magix';
Magix.applyStyle('@index.less');
export default Magix.View.extend({
    tmpl: '@index.html',
    init(extra) {
        let me = this;
        me['@{owner.node}'] = node(me.id);
        me.assign(extra);
    },
    assign(ops) {
        let me = this;
        let v = ops.value;
        let root = me['@{owner.node}'];
        if (v === undefined) v = '';
        if (v !== '') {
            v = +v;
        }
        let diff = me['@{value}'] !== v;
        let preDis = me['@{disabled}'];
        me['@{value}'] = v;
        me['@{step}'] = +ops.step || 1;
        me['@{support.empty}'] = (ops.empty + '') == 'true';
        me['@{format.value}'] = (ops.format + '') == 'true';
        me['@{disabled}'] = root.hasAttribute('disabled');
        me['@{max}'] = Magix.has(ops, 'max') ? +ops.max : Number.MAX_VALUE;
        me['@{min}'] = Magix.has(ops, 'min') ? +ops.min : -Number.MAX_VALUE;
        me['@{ratio}'] = +ops.ratio || 10;
        me['@{tail.length}'] = ops.fixed || 0;
        return diff || preDis != me['@{disabled}'];
    },
    render() {
        let me = this;
        me.digest({
            disabled: me['@{disabled}']
        }, null, () => {
            me['@{fix.value}']();
        });
    },
    '@{fix.value}'() {
        let me = this;
        let v = me['@{value}'];
        if (v !== '') {
            v = me['@{get.value}'](v);//.toFixed(me['@{tail.length}']);
            if (me['@{format.value}']) {
                v = v.toFixed(me['@{tail.length}']);
            }
        }
        me['@{ctrl.input}'] = node('ipt_' + me.id);
        me['@{ctrl.input}'].value = v;
    },
    '@{get.value}'(v) {
        let me = this;
        v = +v;
        if (v || v === 0) {
            let max = me['@{max}'];
            let min = me['@{min}'];
            // let step = me['@{step}'];
            // v = step < 1 ? Math.round(v / step) * step : v;
            if (v > max) {
                v = max;
            } else if (v < min) {
                v = min;
            }
            v = +v.toFixed(me['@{tail.length}']);
        }
        return isNaN(v) ? (me['@{support.empty}'] ? '' : 0) : v;
    },
    '@{set.value}'(v, ignoreFill) {
        let me = this;
        if (v === '' && me['@{support.empty}']) {
            Magix.dispatch(me['@{owner.node}'], 'input', {
                value: me['@{value}'] = v
            });
            return;
        }
        v = me['@{get.value}'](v);
        if (v !== me['@{value}']) {
            if (!ignoreFill) {
                me['@{ctrl.input}'].value = v;
            }
            Magix.dispatch(me['@{owner.node}'], 'input', {
                value: me['@{value}'] = v
            });
        }
        return me['@{value}'];
    },
    '@{num.change}'(increase, enlarge) {
        let me = this;
        console.log(increase);
        let value = me['@{value}'];
        if (value === '') value = 0; //for init
        let step = me['@{step}'];
        let c = value;
        if (enlarge) step *= me['@{ratio}'];
        if (increase) {
            c += step;
        } else {
            c -= step;
        }
        me['@{set.value}'](c);
    },
    '@{cursor.show}'() {
        let me = this;
        let ipt = me['@{ctrl.input}'];
        if (ipt) {
            ipt.focus();
            ipt.selectionStart = ipt.selectionEnd = ipt.value.length;
        }
    },
    '@{simulator.active}'() {
        let me = this;
        me['@{owner.node}'].classList.add('@scoped.style:input-focus');
        if (!Magix.has(me, '@{last.value}')) {
            me['@{last.value}'] = me['@{value}'];
        }
    },
    '@{num.check}<change>'(e) {
        e.stopPropagation();
    },
    '@{active}<focusin>'() {
        this['@{simulator.active}']();
    },
    '@{deactive}<focusout>'(e) {
        let me = this;
        if (!me['@{ui.keep.active}']) {
            me['@{owner.node}'].classList.remove('@scoped.style:input-focus');
            me['@{fix.value}']();
            if (me['@{last.value}'] != me['@{value}']) {
                Magix.dispatch(me['@{owner.node}'], 'change', {
                    value: me['@{value}']
                });
            }
            delete me['@{last.value}'];
        }
    },
    '@{num.change}<click>'(e) {
        let me = this;
        if (!me['@{disabled}'] && !me['@{fast.change.start}']) {
            me['@{num.change}'](e.params.i, e.shiftKey);
            me['@{cursor.show}']();
        }
    },
    '@{fast.start}<mousedown>'(e) {
        let me = this;
        if (!me['@{disabled}']) {
            me['@{ui.keep.active}'] = true;
            me['@{simulator.active}']();
            let i = e.params.i;
            me['@{long.tap.timer}'] = setTimeout(me.wrapAsync(() => {
                me['@{interval.timer}'] = setInterval(me.wrapAsync(() => {
                    me['@{fast.change.start}'] = true;
                    me['@{num.change}'](i);
                    me['@{cursor.show}']();
                }), 50);
            }), 300);
        }
    },
    '@{press.check}<keydown>'(e) {
        if (e.keyCode == 38 || e.keyCode == 40) {
            e.preventDefault();
            let me = this;
            if (!me['@{disabled}']) {
                let target = e.eventTarget;
                let value = target.value;
                if (value === '') {
                    me['@{value}'] = '';
                } else {
                    let v = Number(value);
                    if (v || v === 0) {
                        if (v != me['@{value}']) {
                            me['@{value}'] = v;
                        }
                    }
                }
                me['@{num.change}'](e.keyCode == 38, e.shiftKey);
            }
        }
    },
    '@{prevent}<contextmenu>'(e) {
        e.preventDefault();
    },
    '@{input.check}<input>'(e) {
        e.stopPropagation();
        let target = e.eventTarget;
        this['@{set.value}'](target.value, true);
    },
    '$doc<mouseup>'() {
        let me = this;
        clearTimeout(me['@{long.tap.timer}']);
        clearInterval(me['@{interval.timer}']);
        delete me['@{ui.keep.active}'];
        setTimeout(me.wrapAsync(() => {
            delete me['@{fast.change.start}'];
        }), 0);
    }
});