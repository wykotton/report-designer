/*
    author:xinglie.lkf@alibaba-inc.com
*/
'ref@./index.less';
import Magix, { State } from 'magix';
import DHistory from '../../designer/history';
import Props from '../../designer/props';
export default Magix.View.extend({
    tmpl: '@page.html',
    init() {
        let update = this.render.bind(this);
        State.on('@{event#history.shift}', update);
    },
    render() {
        this.digest({
            props: Props,
            ctrl: State.get('@{stage.page.ctrl}'),
            page: State.get('@{stage.page}')
        });
    },
    '@{update.prop}<input,change>'(e) {
        let { key, use, refresh, write } = e.params;
        let page = State.get('@{stage.page}');
        page[key] = e[use];
        if (write) {
            write(e[use], page, e);
        }
        DHistory["@{save}"]('@{history#save.page.change}', 500);
        State.fire('@{event#stage.page.change}');
        if (refresh) {
            this.render();
        }
    }
});