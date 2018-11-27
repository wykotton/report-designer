/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix from 'magix';
Magix.applyStyle('@guage.less');
let GuargeTitles = ['@{lang#mx-gallery.layout.guage.top}',
    '@{lang#mx-gallery.layout.guage.right}',
    '@{lang#mx-gallery.layout.guage.bottom}',
    '@{lang#mx-gallery.layout.guage.left}'];
export default Magix.View.extend({
    tmpl: '@guage.html',
    init(data) {
        this.set({
            titles: GuargeTitles
        });
        this.assign(data);
    },
    assign(data) {
        let { guage, disabled } = data;
        let gs = guage.split(' ');
        let gts = [];
        for (let g of gs) {
            gts.push(parseInt(g, 10));
        }
        this.set({
            disabled,
            guage: gts
        });
        return true;
    },
    render() {
        this.digest();
    },
    '@{stop}<change>'(e) {
        e.stopPropagation();
    },
    '@{update.columns}<input>'(e) {
        e.stopPropagation();
        let guage = this.get('guage');
        let { index } = e.params;
        guage[index] = e.value;
        Magix.dispatch(this.root, 'change', {
            value: guage.join('px ') + 'px'
        });
    }
});