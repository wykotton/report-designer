/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { State } from 'magix';
Magix.applyStyle('@toolbar.less');
export default Magix.View.extend({
    tmpl: '@toolbar.html',
    init() {
        let update = this.render.bind(this);
        State.on('@{event#history.shift}', update);
        State.on('@{event#stage.page.change}', update);
    },
    render() {
        this.digest({
            page: State.get('@{stage.page}')
        });
    }
});