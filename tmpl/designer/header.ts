/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix from 'magix';
Magix.applyStyle('@header.less');
export default Magix.View.extend({
    tmpl: '@header.html',
    render() {
        this.digest();
    }
});