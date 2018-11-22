/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix from 'magix';
export default Magix.View.extend({
    tmpl: '@guage.html',
    init(data) {
        this.assign(data);
    },
    assign(data) {
        let { guage } = data;
        let gs = guage.split(' ');
        let gts = [];
        for (let g of gs) {
            gts.push(parseInt(g, 10));
        }
        this.set({
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
        Magix.dispatch(this.id, 'change', {
            value: guage.join('px ') + 'px'
        });
    }
});