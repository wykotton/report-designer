/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { State, Vframe, has as Has } from 'magix';
import Dragdrop from '../gallery/mx-dragdrop/index';
Magix.applyStyle('@designer.less');
let WatchSelectElements = {};
let CheckStatus = () => {
    for (let p in WatchSelectElements) {
        let n = WatchSelectElements[p];
        let vf = Vframe.get(n);
        if (vf) {
            vf.invoke('@{check.status}');
            vf.invoke('render');
        }
    }
};
State.on('@{event#history.shift}', CheckStatus);
State.on('@{event#stage.select.elements.change}', CheckStatus);
export default Magix.View.extend({
    tmpl: '@designer.html',
    mixins: [Dragdrop],
    ctor(data) {
        this.assign(data);
        WatchSelectElements[this.id] = this.root;
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
        this.digest();
    },
    '@{update}'(element) {
        this.digest({
            element
        });
    }
});