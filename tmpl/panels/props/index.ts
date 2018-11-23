/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { State, Vframe, node } from 'magix';
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
        let { key, use, element, refresh, ta, bool } = e.params;
        if (use || bool || ta) {
            let props = element.props;
            let target = e.eventTarget;
            let v = ta ? target.value : (bool ? target.checked : e[use]);
            props[key] = v;
        }
        if (refresh) {
            this.render();
            State.fire('@{event#stage.select.element.props.update}');
        }
        let n = node(element.id);
        let vf = Vframe.get(n);
        if (vf) {
            vf.invoke('@{update}', [element]);
        }
        DHistory["@{save}"]('@{history#save.props}' + key, 500);
    }
});