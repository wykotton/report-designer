/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { State, mix } from 'magix';
import Elements from '../elements/index';
import Dialog from '../gallery/mx-dialog/index';
import Consts from './const';
import DHistory from './history';
import Panels from '../panels/index';
Magix.applyStyle('@index.less');
let ApplyState = json => {
    let page = State.get('@{stage.page}');
    let columns = State.get('@{stage.columns}');
    let select = State.get('@{stage.select.elements}');
    let xLines = State.get('@{stage.x.help.lines}');
    let yLines = State.get('@{stage.y.help.lines}');
    let elementsMap = {};
    columns.length = 0;
    for (let col of json.columns) {
        let { elements, map } = Elements["@{by.json}"](col.elements);
        columns.push({
            width: col.width,
            elements
        });
        mix(elementsMap, map);
    }
    xLines.length = 0;
    if (json.xLines) {
        xLines.push(...json.xLines);
    }

    yLines.length = 0;
    if (json.yLines) {
        yLines.push(...json.yLines);
    }
    let sMap = {};
    select.length = 0;
    if (json.select) {
        for (let s of json.select) {
            let e = elementsMap[s.id];
            if (e) {
                sMap[e.id] = 1;
                select.push(e);
            }
        }
    }
    Magix.mix(page, json.page);
    State.set({
        '@{stage.scale}': json.scale || 1,
        '@{stage.select.elements.map}': sMap
    });
};
export default Magix.View.extend({
    tmpl: '@index.html',
    mixins: [Dialog],
    init() {
        State.on('@{event#stage.apply.state}', e => {
            ApplyState(e.json);
        });
        State.set({
            '@{stage.page}': {
                width: Consts["@{stage.width}"],
                height: Consts["@{stage.height}"],
                background: '#ffffff',
                backgroundImage: '',
                backgroundRepeat: 'full',
                backgroundWidth: 0,
                backgroundHeight: 0,
                mode: 'auto'
            },
            '@{stage.scale}': Consts["@{stage.scale}"],
            '@{stage.columns}': [],//init　at stage render fn
            '@{stage.select.elements}': [],
            '@{stage.select.elements.map}': {},
            '@{stage.x.help.lines}': [],
            '@{stage.y.help.lines}': []
        });
        DHistory["@{save.default}"]();
    },
    render() {
        this.digest(null, null, () => {
            Panels["@{open.panels}"]();
        });
    }
});