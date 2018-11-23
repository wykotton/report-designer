/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix from 'magix';
Magix.applyStyle('@column.less');
export default Magix.View.extend({
    tmpl: '@column.html',
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
    '@{stop}<change>'(e) {
        e.stopPropagation();
    },
    '@{update.columns}<input>'(e) {
        let columns = this.get('columns');
        let { index } = e.params;
        columns[index].width = e.value;
        Magix.dispatch(this.root, 'change');
    },
    '@{add.column}<click>'() {
        if (this.get('disabled')) return;
        let columns = this.get('columns');
        columns.push({
            width: 0,
            elements: []
        });
        this.digest({
            columns
        });
        Magix.dispatch(this.root, 'change');
    },
    '@{remove.column}<click>'(e) {
        if (this.get('disabled')) return;
        let columns = this.get('columns');
        let { index } = e.params;
        columns.splice(index, 1);
        this.digest({
            columns
        });
        Magix.dispatch(this.root, 'change');
    }
});