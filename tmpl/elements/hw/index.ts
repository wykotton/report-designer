/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { State } from 'magix';
export default Magix.View.extend({
    tmpl: '@index.html',
    init(data) {
        this.assign(data);
    },
    assign(data) {
        this.set(data);
        this.set({
            scale: State.get('@{stage.scale}')
        });
        return true;
    },
    render() {
        this.digest();
    }
});