/*
    author:xinglie.lkf@alibaba-inc.com
*/
'ref@./index.less';
import Magix, { State } from 'magix';
import DHistory from '../../designer/history';
export default Magix.View.extend({
    tmpl: '@page.html',
    init() {
        let update = this.render.bind(this);
        State.on('@{event#history.shift}', update);
    },
    render() {
        this.digest({
            page: State.get('@{stage.page}')
        });
    },
    '@{change.page}<input>'(e) {
        let { use, from = 'value' } = e.params;
        let page = State.get('@{stage.page}');
        page[use] = e[from];
        DHistory["@{save}"]('@{history#save.page.change}', 500);
        State.fire('@{event#stage.page.change}');
    }
});