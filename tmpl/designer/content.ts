/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { State } from 'magix';
Magix.applyStyle('@content.less');
let Ignores = {
    locked: 1,
    id: 1
}
let Filter = (k, v) => {
    if (Magix.has(Ignores, k)) return undefined;
    return v;
};
export default Magix.View.extend({
    tmpl: '@content.html',
    render() {
        let elements = State.get('@{stage.elements}');
        let page = State.get('@{stage.page}');
        let stage = {
            page,
            elements
        };
        this.digest({
            body: JSON.stringify(stage, Filter, 4)
        });
    }
});