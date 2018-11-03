import Magix, { node } from 'magix';
Magix.applyStyle('@follower.less');
let DEId = Magix.guid('de_');
export default {
    '@{update}'(html: string) {
        let n = node(DEId);
        if (!n) {
            document.body.insertAdjacentHTML('beforeend', `<div class="@follower.less:drag-effect @scoped.style:iconfont" id="${DEId}"/>`);
            n = node(DEId);
        }
        n.innerHTML = html;
    },
    '@{show}'(e: MouseEvent) {
        let s = node(DEId).style;
        s.left = e.pageX + 10 + 'px';
        s.top = e.pageY + 18 + 'px';
    },
    '@{hide}'() {
        let s = node(DEId).style;
        s.left = -1e3 + 'px';
        s.top = -1e3 + 'px';
    }
};