/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { State, Vframe } from 'magix';
import Props from '../../designer/props';
import DHistory from '../../designer/history';
import Transform from '../../util/transform';
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
        let { scale, key, use, element, refresh, bool } = e.params;
        let props = element.props;
        let resetXY = key == 'width' || key == 'height',
            old;
        if (resetXY) {
            old = Transform["@{get.rect.xy}"](props, props.rotate);
        }
        let s = State.get('@{stage.scale}');
        let target = e.eventTarget;
        let v = bool ? target.checked : e[use];
        if (scale) {
            v *= s;
        }
        props[key] = v;
        if (resetXY) {
            let n = Transform["@{get.rect.xy}"](props, props.rotate);
            props.x += old.x - n.x;
            props.y += old.y - n.y;
            refresh = true;
        }
        if (refresh) {
            this.render();
            State.fire('@{event#stage.select.element.props.update}');
        }
        let vf = Vframe.get(element.id);
        if (vf) {
            vf.invoke('@{update}', [element]);
        }
        DHistory["@{save}"]('@{history#save.props}' + key, 500);
    }
});