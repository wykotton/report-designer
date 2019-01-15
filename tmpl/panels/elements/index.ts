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
    '@{select.element}<click>'(e: Magix5.MagixMouseEvent) {
        let { element } = e.params;
        StageElements["@{multi.select}"](e, element);
    },
    '@{drag.start}<dragstart>'(e: Magix5.MagixMouseEvent & DragEvent) {
        let me = this;
        me['@{drag.index}'] = e.params.index;
        me['@{drag.node}'] = e.eventTarget;
        e.dataTransfer.effectAllowed = 'all';
        //firefox required setData
        e.dataTransfer.setData('text/plain', 'fix ff');
    },
    '@{drag.over}<dragover>'(e: Magix5.MagixMouseEvent & DragEvent) {
        let me = this;
        e.preventDefault();
        if (me['@{drag.node}'] != e.eventTarget) {
            e.dataTransfer.dropEffect = 'move';
            let rect = e.eventTarget.getBoundingClientRect();
            let onTop = (rect.top + rect.height / 2) > e.pageY;
            let index = e.params.index;
            me.digest({
                onTop,
                drag: true,
                index
            });
        } else {
            e.dataTransfer.dropEffect = 'none';
            me.digest({
                drag: false
            });
        }
    },
    '@{drag.end}<dragend>'(e: Magix5.MagixMouseEvent) {
        let me = this;
        let data = me.get();
        if (data.drag) {
            let startIndex = me['@{drag.index}'];
            let drag = data.elements[startIndex];
            data.elements.splice(data.index + (data.onTop ? 1 : 0), 0, drag);
            if (data.index < startIndex) {
                data.elements.splice(startIndex + 1, 1);
            } else {
                data.elements.splice(startIndex, 1);
            }
            me.set({
                elements: data.elements
            });
            State.fire('@{event#stage.elements.change}');
        }
        me.digest({
            drag: false
        });
    }
});