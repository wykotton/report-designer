import Magix, { node } from 'magix';
let Panels = [{
    title: '@{lang#panel.elements}',
    icon: '&#xe629;',
    width: 100,
    height() {
        return Math.max(window.innerHeight - 160, 100);
    },
    left: 30,
    top: 100,
    show: true,
    id: 'elements',
    view: '@./elements/index'
}, {
    title: '@{lang#panel.props}',
    icon: '&#xe7a1;',
    width: 300,
    height() {
        return 200;
    },
    right: 230,
    top: 100,
    show: false,
    id: 'props',
    view: '@./props/index'
}, {
    title: '@{lang#panel.data}',
    icon: '&#xe609;',
    width: 200,
    height() {
        return Math.max(window.innerHeight - 160, 100);
    },
    show:true,
    right: 20,
    top: 100,
    id: 'data',
    view: '@./props/index'
}];
let PanelsMap = Magix.toMap(Panels, 'id');
export default Magix.mix({
    '@{open.panels}'() {
        for (let p of Panels) {
            if (p.show) {
                this['@{open.panel}'](p.id);
            }
        }
    },
    '@{open.panel}'(id) {
        let info = PanelsMap[id];
        if (!info.opened) {
            info.opened = 1;
            if (!info.eId) {
                info.eId = Magix.guid('panel_');
                node('app').insertAdjacentHTML('beforeend', `<div id="${info.eId}"></div>`);
                let root = Magix.Vframe.get(Magix.config('rootId'));
                info.close = () => {
                    this['@{close.panel}'](info.id);
                };
                root.mountVframe(info.eId, '@./panel', info);
            } else {
                node(info.eId).style.display = 'block';
            }
            this.fire('change');
        }
    },
    '@{close.panel}'(id) {
        let info = PanelsMap[id];
        if (info.opened) {
            info.opened = 0;
            node(info.eId).style.display = 'none';
            this.fire('change');
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
}, Magix.Event);