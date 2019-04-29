/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { State } from 'magix';
Magix.applyStyle('@content.less');
export default Magix.View.extend({
    tmpl: '@content.html',
    render() {
        let elements = State.get('@{stage.elements}');
        let page = State.get('@{stage.page}');
        let filters = [];
        for (let e of elements) {
            let m = {
                type: e.type,
                props: {}
            };
            let json = e.ctrl.json,
                f;
            if (json) {
                for (let p in e.props) {
                    f = json[p];
                    if (f === 1) {
                        m.props[p] = e.props[p];
                    } else if(f) {
                        m.props[p] = f(e.props[p]);
                    }
                }
            } else {
                m.props = e.props;
            }
            filters.push(m);
        }
        let stage = {
            page,
            elements: filters
        };
        this.digest({
            body: JSON.stringify(stage, null, 4)
        });
    }
});