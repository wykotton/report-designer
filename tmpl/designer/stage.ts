/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix from 'magix';
Magix.applyStyle('@stage.less');
export default Magix.View.extend({
    tmpl: '@stage.html',
    render() {
        this.digest();
    }
});