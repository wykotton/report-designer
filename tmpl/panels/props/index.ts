/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { State, Vframe, node } from 'magix';
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
        let { key, use, element, refresh, native, write } = e.params;
        if (use || native) {
            let props = element.props;
            let resetXY = key == 'width' || key == 'height',
                old;
            if (resetXY) {
                old = Transform["@{get.rect.xy}"](props, props.rotate);
            }
            let v = native ? e.eventTarget[native] : e[use];
            if (write) {
                v = write(v, props);
            }
            props[key] = v;
            if (resetXY) {
                let n = Transform["@{get.rect.xy}"](props, props.rotate);
                props.x += old.x - n.x;
                props.y += old.y - n.y;
                refresh = true;
            }
        }
        if (refresh) {
            this.render();
            State.fire('@{event#stage.select.element.props.update}');
        }
        let n = node(element.id);
        let vf = Vframe.byNode(n);
        if (vf) {
            vf.invoke('@{update}', [element]);
        }
        DHistory["@{save}"]('@{history#save.props}' + key, 500);
    }
});