import { toMap as ToMap } from 'magix';
import { Layout1, Layout2, Layout3, Layout4 } from './layout/designer';
import H from './hw/designer';
let Elements = [Layout1, Layout2, Layout3, Layout4, H];
let ElementsMap = ToMap(Elements, 'type');
let Groups = [{
    icon: '&#xe764;',
    title: '布局',
    subs: [Layout1, Layout2, Layout3, Layout4]
}, H];
export default {
    '@{element.list}'() {
        return Groups;
    },
    '@{by.json}'(elements) {
        let map = {};
        let walk = es => {
            for (let e of es) {
                let ctrl = ElementsMap[e.type];
                e.ctrl = ctrl;
                map[e.id] = e;
                if (e.role == 'layout') {
                    for (let c of e.props.columns) {
                        walk(c.elements);
                    }
                }
            }
        };
        walk(elements);
        return {
            elements,
            map
        };
    }
};