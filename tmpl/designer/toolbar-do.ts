/*
    author:xinglie.lkf@alibaba-inc.com
*/
'ref@./toolbar.less';
import Magix, { State } from 'magix';
import DHistory from './history';
export default Magix.View.extend({
    tmpl: '@toolbar-do.html',
    init() {
        let update = this.render.bind(this);
        State.on('@{event#history.shift}', update);
        State.on('@{event#history.status.change}', update);
    },
    render() {
        this.digest({
            status: DHistory["@{query.status}"]()
        });
    },
    '@{do.exec}<click>'(e) {
        let { s, b } = e.params;
        if (b) {
            if (s == '-') {
                DHistory["@{undo}"]();
            } else {
                DHistory["@{redo}"]();
            }
        }
    }
});