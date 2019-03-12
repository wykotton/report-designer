import Magix, { node } from 'magix';
const CursorId = Magix.guid('cursor_');
Magix.applyStyle('@cursor.less');
const Body = document.body;
export default {
    '@{show}'(e: HTMLElement) {
        let styles = getComputedStyle(e);
        this['@{show.by.type}'](styles.cursor);
    },
    '@{show.by.type}'(cursor: string) {
        let n = node(CursorId);
        if (!n) {
            document.body.insertAdjacentHTML('beforeend', `<div class="@cursor.less:cursor" id="${CursorId}"/>`);
            n = node(CursorId);
        }
        n.style.cursor = cursor;
        n.style.display = 'block';
    },
    '@{hide}'() {
        let n = node(CursorId);
        if (n) {
            n.style.display = 'none';
        }
    },
    '@{root.show.by.type}'(cursor: string) {
        Body.style.cursor = cursor;
    },
    '@{root.hide}'() {
        Body.style.cursor = 'auto';
    }
}