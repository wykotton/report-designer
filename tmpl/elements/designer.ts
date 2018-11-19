/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { State, Vframe, has as Has } from 'magix';
import Dragdrop from '../gallery/mx-dragdrop/index';
Magix.applyStyle('@designer.less');
let WatchSelectElements = {};
State.on('@{event#stage.select.elements.change}', () => {
    for (let p in WatchSelectElements) {
        let vf = Vframe.get(p);
        if (vf) {
            vf.invoke('@{check.status}');
            vf.invoke('render');
        }
    }
});
export default Magix.View.extend({
    tmpl: '@designer.html',
    mixins: [Dragdrop],
    ctor(data) {
        this.assign(data);
        WatchSelectElements[this.id] = 1;
        this.on('destroy', () => {
            delete WatchSelectElements[this.id];
        });
    },
    '@{check.status}'() {
        let map = State.get('@{stage.select.elements.map}');
        let elements = State.get('@{stage.select.elements}');
        let count = elements.length;
        let data = this.get();
        let id = data.element.id;
        this.set({
            selected: Has(map, id),
            count
        });
    },
    assign(data) {
        this.set(data);
        this['@{check.status}']();
        return true;
    },
    render() {
        this.digest({
            page: State.get('@{stage.page}')
        });
    },
    '@{update}'(element) {
        this.digest({
            element
        });
    }
});