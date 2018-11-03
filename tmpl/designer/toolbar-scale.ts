/*
    author:xinglie.lkf@alibaba-inc.com
*/
'ref@./toolbar.less';
import Magix, { State } from 'magix';
import DHistory from './history';
export default Magix.View.extend({
    tmpl: '@toolbar-scale.html',
    init() {
        let update = this.render.bind(this);
        State.on('@{event#stage.scale.change}', update);
        State.on('@{event#history.shift}', update);
    },
    render() {
        this.digest({
            scale: State.get('@{stage.scale}')
        });
    },
    '@{scale}<click>'(e) {
        let { s } = e.params;
        let scale = this.get('scale'),
            old = scale;
        if (s == '+') {
            scale += 0.5;
            if (scale > 5) scale = 5;
        } else {
            scale -= 0.5;
            if (scale < 0.5) scale = 0.5;
        }
        if (old != scale) {
            State.set({
                '@{stage.scale}': scale
            });
            //this.render();
            State.fire('@{event#stage.scale.change}', {
                step: scale / old
            });
            DHistory["@{save}"]();
        }
    }
});