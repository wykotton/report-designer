/*
    author:xinglie.lkf@alibaba-inc.com
 */
import Magix, { node } from 'magix';
import Monitor from '../mx-monitor/index';
Magix.applyStyle('@index.less');
export default Magix.View.extend({
    tmpl: '@index.html',
    init(extra) {
        let me = this;
        me.assign(extra);
        Monitor['@{setup}']();
        me.on('destroy', () => {
            Monitor['@{remove}'](me);
            Monitor['@{teardown}']();
        });
    },
    assign(ops) {
        let me = this;
        let width = ops.width || 140;
        let valueKey = ops.valueKey || 'id';
        let textKey = ops.textKey || 'text';
        me['@{list}'] = ops.list;
        me['@{width}'] = width;
        me['@{value.key}'] = valueKey;
        me['@{text.key}'] = textKey;
        me['@{menu.disabled}'] = ops.disabled || {};
        me['@{fn.picked}'] = ops.picked;
        return true;
    },
    render() {
        let me = this;
        me.digest({
            disabled: me['@{menu.disabled}'],
            list: me['@{list}'],
            width: me['@{width}'],
            valueKey: me['@{value.key}'],
            textKey: me['@{text.key}']
        });
    },
    '@{inside}'(node) {
        return Magix.inside(node, this.root);
    },
    '@{show}'(e) {
        let me = this;
        if (!me['@{ui.show}']) {
            me['@{ui.show}'] = 1;
            let n = node('cnt_' + me.id);
            let width = n.clientWidth;
            let height = n.clientHeight;
            let left = e.pageX;
            let top = e.pageY;
            if ((left + width) > window.innerWidth) {
                left = left - width;
                if (left < 0) left = 0;
            }
            if ((top + height) > window.innerHeight) {
                top -= height;
                if (top < 0) top = 0;
            }
            n.style.left = left + 'px';
            n.style.top = top + 'px';
            Monitor['@{add}'](me);
        }
    },
    '@{hide}'() {
        let me = this;
        if (me['@{ui.show}']) {
            me['@{ui.show}'] = false;
            let n = node('cnt_' + me.id);
            n.style.left = '-10000px';
            Monitor['@{remove}'](me);
        }
    },
    '@{hover}<mouseover,mouseout>'(e: NMagix5.DOMEvent) {
        if (e.params.d) return;
        let target = e.eventTarget;
        let flag = !Magix.inside(e.relatedTarget as HTMLElement, target);
        if (flag) {
            target.classList[e.type == 'mouseout' ? 'remove' : 'add']('@index.less:over');
        }
    },
    '@{select}<click>'(e: NMagix5.DOMEvent) {
        if (e.params.d) return;
        let me = this;
        me['@{hide}']();
        let fn = me['@{fn.picked}'];
        if (fn) {
            fn(e.params.item);
        }
    },
    '@{prevent}<contextmenu>'(e) {
        e.preventDefault();
    }
}, {
        show(view, e, ops) {
            let id = 'ctx_' + view.id;
            let n = node(id);
            let vf = n && Magix.Vframe.byNode(n);
            if (vf) {
                vf.invoke('assign', [ops]);
                vf.invoke('render');
                vf.invoke('@{show}', [e]);
            } else {
                document.body.insertAdjacentHTML("beforeend", `<div id="${id}"></div>`);
                vf = view.owner.mountVframe(node(id), '@moduleId', ops);
                vf.invoke('@{show}', [e]);
            }
        }
    });