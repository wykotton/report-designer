/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix from 'magix';
export default Magix.View.extend({
    tmpl:'@index.html',
    render(){
        this.digest();
    }
});