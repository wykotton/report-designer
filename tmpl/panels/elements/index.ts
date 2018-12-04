/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { State, node } from 'magix';
import Convert from '../../util/converter';
import StageElements from '../../designer/stage-elements';
Magix.applyStyle('@index.less');
let RId = Magix.guid('rp_');
let RectPole = {
    '@{init}'() {
        let n = node(RId);
        if (!n) {
            document.body.insertAdjacentHTML("beforeend", `<div class="@scoped.style:pa @index.less:rect" id="${RId}"></div>`)
        }
    },
    '@{show}'(element) {
        let ns = node(RId).style;
        let { props } = element;
        let pos = Convert["@{stage.to.real.coord}"](props);
        ns.left = pos.x + 'px';
        ns.top = pos.y + 'px';
        ns.width = props.width + 'px';
        ns.height = props.height + 'px';
        ns.borderWidth = 2 * State.get('@{stage.scale}') + 'px';
        let r = props.rotate || 0;
        ns.transform = `rotate(${r}deg)`;
    },
    '@{hide}'() {
        node(RId).style.left = '-10000px';
    }
};
export default Magix.View.extend({
    tmpl: '@index.html',
    init() {
        RectPole["@{init}"]();
        let update = this.render.bind(this);
        State.on('@{event#history.shift}', update);
        State.on('@{event#stage.elements.change}', update);
        State.on('@{event#stage.select.elements.change}', update);
    },
    render() {
        let elements = State.get('@{stage.elements}');
        let selectedMap = State.get('@{stage.select.elements.map}');
        this.digest({
            selectedMap,
            elements
        });
    },
    '@{show.rect}<mouseover>'(e) {
        let flag = Magix.inside(e.relatedTarget, e.eventTarget);
        if (!flag) {
            let { element } = e.params;
            RectPole["@{show}"](element);
        }
    },
    '@{hide.rect}<mouseout>'(e) {
        let flag = Magix.inside(e.relatedTarget, e.eventTarget);
        if (!flag) {
            RectPole["@{hide}"]();
        }
    },
    '@{select.element}<click>'(e: Magix.DOMEvent) {
        let { element } = e.params;
        StageElements["@{multi.select}"](e, element);
    }
});