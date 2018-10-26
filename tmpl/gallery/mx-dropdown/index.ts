/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix from 'magix';
import Monitor from '../mx-monitor/index';
Magix.applyStyle('@index.less');
export default Magix.View.extend({
    tmpl: '@index.html',
    init(data) {
        Monitor["@{setup}"]();
        this.on('destroy', () => {
            Monitor['@{remove}'](this);
            Monitor['@{teardown}']();
        });
        this.assign(data);
    },
    assign(data) {
        let me = this;
        let selected = data.selected;
        let textKey = data.textKey || '';
        let valueKey = data.valueKey || '';
        let emptyText = data.emptyText || '';
        let disabled = (data.disabled + '') === 'true';
        let list = data.list || [];
        list = list.slice();
        let map = Magix.toMap(list, valueKey);
        if (emptyText) {
            if (textKey && valueKey) {
                if (!map['']) {
                    let temp = {};
                    temp[textKey] = emptyText;
                    temp[valueKey] = '';
                    list.unshift(temp);
                    map[''] = temp;
                }
            } else {
                if (!map[emptyText]) {
                    list.unshift(emptyText);
                    map[emptyText] = emptyText;
                }
            }
        }
        if (!selected && emptyText && !(textKey || valueKey)) {
            selected = emptyText;
        }
        if (!selected || !map[selected]) { //未提供选项，或提供的选项不在列表里，则默认第一个
            selected = map[selected] || list[0];
            if (textKey && valueKey) {
                selected = selected[valueKey];
            }
        }
        let selectedText = textKey && valueKey ? map[selected][textKey] : selected;
        me.set({
            selected,
            selectedText,
            list,
            textKey,
            valueKey,
            emptyText,
            disabled
        });
        return true;
    },
    render() {
        this.digest();
    },
    '@{inside}'(node) {
        return Magix.inside(node, this.id);
    },
    '@{show}'() {
        let me = this;
        let node = Magix.node('dd_' + me.id);
        if (!node.classList.contains('@index.less:open')) {
            node.classList.add('@index.less:open');
            let r = me.get('rList');
            let resume = () => {
                node = Magix.node('list_' + me.id);
                let active = node.querySelector('li[active]') as HTMLLIElement & {
                    scrollIntoViewIfNeeded: () => void
                };
                if (active && active.scrollIntoViewIfNeeded) {
                    active.scrollIntoViewIfNeeded();
                }
            };
            if (!r) {
                me.digest({
                    rList: true
                }, null, resume);
            } else {
                resume();
            }
            Monitor['@{add}'](me);
        }
    },
    '@{hide}'() {
        let me = this;
        let node = Magix.node('dd_' + me.id);
        if (node.classList.contains('@index.less:open')) {
            node.classList.remove('@index.less:open');
            Monitor['@{remove}'](me);
        }
    },
    '@{toggle}<click>'() {
        let me = this;
        let node = Magix.node('dd_' + me.id);
        if (node.classList.contains('@index.less:open')) {
            me['@{hide}']();
        } else if (!node.classList.contains('@index.less:notallowed')) {
            me['@{show}']();
        }
    },
    '@{select}<click>'(e) {
        let me = this;
        me['@{hide}']();
        let valueKey = me.get('valueKey');
        let textKey = me.get('textKey');
        let lastSelected = me.get('selected');
        let item = e.params.item;
        let selected = item;
        let selectedText = item;
        if (textKey && valueKey) {
            selectedText = item[textKey];
            selected = item[valueKey];
        }
        if (lastSelected !== selected) {
            me.digest({
                selected,
                selectedText
            });
            let node = Magix.node(me.id);
            Magix.fire(node, 'change', {
                item,
                value: valueKey ? item[valueKey] : item,
                text: textKey ? item[textKey] : item
            });
        }
    },
});