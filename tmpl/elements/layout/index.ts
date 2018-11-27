/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix from 'magix';
import StageElements from '../../designer/stage-elements';
import DragDrop from '../../gallery/mx-dragdrop/index';
Magix.applyStyle('@index.less');
export default Magix.View.extend({
    tmpl: '@index.html',
    mixins: [DragDrop],
    init(data) {
        this.assign(data);
    },
    assign(data) {
        this.set(data);
        return true;
    },
    render() {
        this.digest();
    },
    '@{element.start.drag}<mousedown>'(e) {
        if (e.from != 'layout') {
            e.from = 'layout';
            StageElements["@{select.or.move.elements}"](e, this);
        }
    }
});