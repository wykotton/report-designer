/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { State, Vframe } from 'magix';
import Props from '../../designer/props';
import DHistory from '../../designer/history';
Magix.applyStyle('@index.less');
export default Magix.View.extend({
    tmpl: '@index.html',
    init() {
        let update = this['@{throttle}'](this.render.bind(this), 100);
        State.on('@{event#stage.select.elements.change}', update);
        State.on('@{event#stage.select.element.props.change}', update);
        State.on('@{event#history.shift}', update);
    },
    render() {
        this.digest({
            scale: State.get('@{stage.scale}'),
            props: Props,
            elements: State.get('@{stage.select.elements}')
        });
    },
    '@{update.prop}<input,change>'(e) {
        let { key, use, element, refresh, bool } = e.params;
        if (use || bool) {
            let props = element.props;
            let target = e.eventTarget;
            let v = bool ? target.checked : e[use];
            console.log(v);
            props[key] = v;
        }
        if (refresh) {
            this.render();
            State.fire('@{event#stage.select.element.props.update}');
        }
        let vfId = document.querySelector(`[eid=${element.id}]`).id;
        let vf = Vframe.get(vfId);
        if (vf) {
            vf.invoke('@{update}', [element]);
        }
        DHistory["@{save}"]('@{history#save.props}' + key, 500);
    }
});