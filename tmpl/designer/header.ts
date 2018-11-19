/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { State } from 'magix';
import Elements from '../elements/index';
import Dragdrop from '../gallery/mx-dragdrop/index';
import Follower from '../gallery/mx-pointer/follower';
Magix.applyStyle('@header.less');
export default Magix.View.extend({
    tmpl: '@header.html',
    mixins: [Dragdrop],
    render() {
        this.digest({
            elements: Elements["@{element.list}"]()
        });
    },
    '@{add.element}<mousedown>'(e) {
        let { ctor } = e.params;
        Follower["@{update}"](ctor.icon);
        let moved = false, hoverNode = null;
        State.set({
            '@{memory.cache.element}': ctor
        });
        this['@{drag.drop}'](e, ex => {
            Follower["@{show}"](ex);
            moved = true;
        }, (ex: Magix.DOMEvent) => {
            Follower["@{hide}"]();
            if (!moved) {
                State.fire('@{event#toolbox.add.element}', {
                    pageX: (Math.random() * 50) | 0,
                    pageY: (Math.random() * 50) | 0
                });
                return;
            }
            if (ex) {
                hoverNode = Dragdrop["@{from.point}"](ex.clientX, ex.clientY);
                State.fire('@{event#toolbox.drag.element.drop}', {
                    node: hoverNode,
                    pageX: ex.pageX,
                    pageY: ex.pageY
                });
            }
        });
    }
});