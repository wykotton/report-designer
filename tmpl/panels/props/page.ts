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
let PageModes = [{
    text: I18n('@{lang#props.full.mode}'),
    value: '1'
}, {
    text: '1:1',
    value: '0.5 0.5'
}, {
    text: '1:2',
    value: '0.33 0.67'
}, {
    text: '1:3',
    value: '0.25 0.75'
}, {
    text: '2:1',
    value: '0.67 0.33'
}, {
    text: '3:1',
    value: '0.75 0.25'
}, {
    text: '1:2:1',
    value: '0.25 0.5 0.25'
}, {
    text: '1:3:1',
    value: '0.2 0.6 0.2'
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
            modes: PageModes,
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
        State.fire('@{event#stage.page.change}', {
            mode: use == 'mode'
        });
        if (refresh) {
            this.render();
        }
    }
});