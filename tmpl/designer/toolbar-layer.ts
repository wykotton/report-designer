/*
    author:xinglie.lkf@alibaba-inc.com
*/
'ref@./toolbar.less';
import Magix, { State } from 'magix';
import DHistory from './history';
import { StageElements } from './workspace';
export default Magix.View.extend({
    tmpl: '@toolbar-layer.html',
    init() {
        let update = this.render.bind(this);
        State.on('@{event#history.shift}', update);
        State.on('@{event#stage.elements.change}', update);
        State.on('@{event#stage.select.elements.change}', update);
        State.on('@{event#stage.select.element.props.update}', update);
    },
    render() {
        let stageElements = State.get('@{stage.elements}');
        this.digest({
            top: stageElements[stageElements.length - 1],
            bottom: stageElements[0],
            elements: State.get('@{stage.select.elements}')
        });
    },
    '@{move.element}<click>'(e) {
        if (e.eventTarget.classList.contains('@toolbar.less:toolbar-item-disabled')) {
            return;
        }
        let { to } = e.params;
        let element = this.get('elements')[0];
        if (StageElements["@{move.element}"](to, element)) {
            State.fire('@{event#stage.elements.change}');
            DHistory["@{save}"]();
        }
    }
});