/*
    author:xinglie.lkf@alibaba-inc.com
*/
'ref@./index.less';
import Magix, { State } from 'magix';
import DHistory from '../../designer/history';
import I18n from '../../i18n/index';
let BackgroundRepeat = [{
    text: I18n('@{lang#props.full}'),
    value: 'full'
}, {
    text: I18n('@{lang#props.no.repeat}'),
    value: 'no-repeat'
}, {
    text: I18n('@{lang#props.repeat.x}'),
    value: 'repeat-x'
}, {
    text: I18n('@{lang#props.repeat.y}'),
    value: 'repeat-y'
}, {
    text: I18n('@{lang#props.repeat}'),
    value: 'repeat'
}];
let PageScaleTypes = [{
    text: I18n('@{lang#props.scale.auto}'),
    value: 'auto'
}, {
    text: I18n('@{lang#props.scale.full}'),
    value: 'full'
}];
export default Magix.View.extend({
    tmpl: '@page.html',
    init() {
        let update = this.render.bind(this);
        State.on('@{event#history.shift}', update);
    },
    render() {
        this.digest({
            repeats: BackgroundRepeat,
            scaleTypes: PageScaleTypes,
            page: State.get('@{stage.page}')
        });
    },
    '@{change.page}<input,change>'(e) {
        let { use, from = 'value', refresh } = e.params;
        let page = State.get('@{stage.page}');
        page[use] = e[from];
        if (use == 'backgroundImage') {
            page.backgroundWidth = e.width;
            page.backgroundHeight = e.height;
        }
        DHistory["@{save}"]('@{history#save.page.change}', 500);
        State.fire('@{event#stage.page.change}');
        if (refresh) {
            this.render();
        }
    }
});