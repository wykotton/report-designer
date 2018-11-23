import { toMap as ToMap } from 'magix';
import Layout from './layout/designer';
import XText from './text/designer';
let Elements = [Layout, XText];
let ElementsMap = ToMap(Elements, 'type');
let Groups = [Layout, XText, {
    icon: '&#xe629;',
    title: '图表',
    subs: [XText, XText, XText, XText, XText, XText, XText, XText]
}];
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