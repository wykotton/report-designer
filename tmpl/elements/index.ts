import { toMap as ToMap, guid } from 'magix';
import H from './hw/designer';
let Elements = [H];
let ElementsMap = ToMap(Elements, 'type');
let Groups = [{
    icon: '&#xe64b;',
    title: 'groups',
    subs: [H, H, H, H, H, H]
}, H];
export default {
    '@{element.list}'() {
        return Groups;
    },
    '@{by.json}'(elements) {
        let es = [], map = {};
        for (let e of elements) {
            let ctor = ElementsMap[e.type];
            e.ctor = ctor;
            es.push(e);
            map[e.id] = e;
        }
        return {
            elements: es,
            map
        };
    }
};