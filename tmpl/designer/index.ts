/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { State } from 'magix';
import Elements from '../elements/index';
import Dialog from '../gallery/mx-dialog/index';
import Consts from './const';
import DHistory from './history';
import Panels from '../panels/index';
let PageCtrl = Elements["@{get.page}"]();
Magix.applyStyle('@index.less');
let ApplyState = json => {
    let page = State.get('@{stage.page}');
    let layouts = State.get('@{stage.layouts}');
    let select = State.get('@{stage.select.elements}');
    let xLines = State.get('@{stage.x.help.lines}');
    let yLines = State.get('@{stage.y.help.lines}');
    let { elements, map } = Elements["@{by.json}"](json.layouts);
    layouts.length = 0;
    layouts.push(...elements);
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
            let e = map[s.id];
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
        State.on('@{event#stage.apply.state}', (e: {
            json: any
        } & Magix.TriggerEventDescriptor) => {
            ApplyState(e.json);
        });
        State.set({
            '@{stage.page.ctrl}': PageCtrl,
            '@{stage.page}': PageCtrl.getProps(),
            '@{stage.scale}': Consts["@{stage.scale}"],
            '@{stage.layouts}': [],
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