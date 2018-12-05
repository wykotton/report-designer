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
        let { ctrl } = e.params,
            moved = 0;
        Follower["@{update}"](ctrl.icon);
        State.set({
            '@{memory.cache.element.ctrl}': ctrl
        });
        this['@{drag.drop}'](e, ex => {
            if (moved) {
                Follower["@{show}"](ex);
                State.fire('@{event#toolbox.drag.hover.change}', {
                    pageX: ex.pageX,
                    pageY: ex.pageY,
                    clientX: ex.clientX,
                    clientY: ex.clientY
                });
            }
            moved = 1;
        }, (ex: Magix.DOMEvent) => {
            Follower["@{hide}"]();
            if (moved) {
                if (ex) {
                    State.fire('@{event#toolbox.drag.element.drop}');
                }
            } else {
                State.fire('@{event#toolbox.add.element}');
            }
            State.set({
                '@{memory.cache.element.ctrl}': null
            });
        });
    }
});