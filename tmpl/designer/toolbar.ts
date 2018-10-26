/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix from 'magix';
Magix.applyStyle('@toolbar.less');
export default Magix.View.extend({
    tmpl: '@toolbar.html',
    render() {
        this.digest();
    }
});