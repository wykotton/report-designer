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
        let { ctrl } = e.params;
        Follower["@{update}"](ctrl.icon);
        State.set({
            '@{memory.cache.element.ctrl}': ctrl
        });
        this['@{drag.drop}'](e, ex => {
            Follower["@{show}"](ex);
            State.fire('@{event#toolbox.drag.hover.change}', {
                pageX: ex.pageX,
                pageY: ex.pageY,
                clientX: ex.clientX,
                clientY: ex.clientY
            });
        }, (ex: Magix.DOMEvent) => {
            Follower["@{hide}"]();
            if (ex) {
                State.fire('@{event#toolbox.drag.element.drop}');
            }
            State.set({
                '@{memory.cache.element.ctrl}': null
            });
        });
    }
});