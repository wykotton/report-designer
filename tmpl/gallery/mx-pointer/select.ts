/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { node } from 'magix';
Magix.applyStyle('@select.less');
let SId = Magix.guid('set_');
export default {
    '@{init}'() {
        let n = node(SId);
        if (!n) {
            document.body.insertAdjacentHTML('beforeend', `<div id="${SId}" class="@select.less:rect"></div>`)
        }
    },
    '@{update}'(left, top, width, height) {
        let ns = node(SId).style;
        ns.left = left + 'px';
        ns.top = top + 'px';
        ns.width = width + 'px';
        ns.height = height + 'px';
        ns.display = 'block';
    },
    '@{hide}'() {
        node(SId).style.display = 'none';
    }
};