/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix from 'magix';
Magix.applyStyle('@index.less');
export default Magix.View.extend({
    tmpl: '@index.html',
    render() {
        this.digest();
    },
    '$doc<paste>'(e: ClipboardEvent) {
        let data = e.clipboardData.getData('text/plain');
        this.digest({
            stage: JSON.parse(data)
        });
    }
});