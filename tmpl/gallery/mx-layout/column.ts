/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix from 'magix';
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
        Magix.dispatch(this.id, 'change');
    }
});