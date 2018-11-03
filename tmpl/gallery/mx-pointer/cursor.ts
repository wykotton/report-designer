import Magix, { node } from 'magix';
const CursorId = Magix.guid('cursor_');
Magix.applyStyle('@cursor.less');
export default {
    '@{show}'(e: HTMLElement) {
        let styles = getComputedStyle(e);
        this['@{show.by.type}'](styles.cursor);
    },
    '@{show.by.type}'(cursor) {
        let n = node(CursorId);
        if (!n) {
            document.body.insertAdjacentHTML('beforeend', `<div class="@cursor.less:cursor" id="${CursorId}"/>`);
            n = node(CursorId);
        }
        n.style.cursor = cursor;
        n.style.display = 'block';
    },
    '@{hide}'() {
        node(CursorId).style.display = 'none';
    }
}