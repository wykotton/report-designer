import Magix, { node, State, Vframe } from 'magix';
let Panels = [{
    title: '@{lang#panel.props}',
    icon: '&#xe7a1;',
    width: 240,
    height: 120,
    right: 10,
    top: 90,
    show: true,
    resizeY: true,
    id: 'p-props',
    view: '@./props/index'
}, {
    title: '@{lang#panel.data}',
    icon: '&#xe609;',
    width: 200,
    height: 120,
    show: false,
    right: 260,
    top: 90,
    id: 'p-data',
    view: '@./data/index'
}];
let PanelsMap = Magix.toMap(Panels, 'id');
export default {
    '@{open.panels}'() {
        for (let p of Panels) {
            if (p.show) {
                this['@{open.panel}'](p.id, true);
            }
        }
        State.fire('@{event#panel.change}');
    },
    '@{open.panel}'(id, prevent) {
        let info = PanelsMap[id];
        if (!info.opened) {
            info.opened = 1;
            if (!info.eId) {
                info.eId = Magix.guid('panel_');
                let app = node(Magix.config('rootId'));
                app.insertAdjacentHTML('beforeend', `<div id="${info.eId}"></div>`);
                let root = Vframe.get(app);
                info.close = () => {
                    this['@{close.panel}'](info.id);
                };
                root.mountVframe(node(info.eId), '@./panel', info);
            } else {
                node(info.eId).style.display = 'block';
            }
            if (!prevent) {
                State.fire('@{event#panel.change}');
                let vf = Vframe.get(node(info.eId));
                vf.invoke('@{show}');
            }
        }
    },
    '@{close.panel}'(id) {
        let info = PanelsMap[id];
        if (info.opened) {
            info.opened = 0;
            let n = node(info.eId);
            n.style.display = 'none';
            State.fire('@{event#panel.change}');
            let vf = Vframe.get(n);
            vf.invoke('@{hide}');
        }
    },
    '@{toggle.panel}'(id) {
        let info = PanelsMap[id];
        if (info.opened) {
            this['@{close.panel}'](id);
        } else {
            this['@{open.panel}'](id);
        }
    },
    '@{support.panels}'() {
        return Panels;
    }
};