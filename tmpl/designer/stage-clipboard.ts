import Magix, { State } from 'magix';
import StageElements from './stage-elements';
import StageSelectElements from './stage-select';
let Clone = a => {
    if (Array.isArray(a)) {
        let c = [];
        for (let b of a) {
            c.push(Clone(b));
        }
        a = c;
    } else if (Magix.type(a) == 'Object') {
        let c = {};
        for (let b in a) {
            c[b] = Clone(a[b]);
        }
        a = c;
    }
    return a;
};
export default {
    '@{has.elements}'() {
        let list = this['@{copy.list}'] || [];
        return list.length;
    },
    '@{get.copy.list}'() {
        let list = this['@{copy.list}'] || [];
        return list;
    },
    '@{copy.elements}'() {
        let me = this;
        let list = [];
        let elements = State.get('@{stage.select.elements}');
        for (let m of elements) {
            list.push(m);
        }
        me['@{copy.list}'] = list;
    },
    '@{cut.elements}'() {
        //编辑锁定的不能剪切
        let elements = State.get('@{stage.select.elements}');
        if (elements.length == 1 && elements[0].props.locked) {
            return;
        }
        this['@{copy.elements}']();
        this['@{is.cut}'] = true;
    },
    '@{paste.elements}'(xy?: { x: number, y: number }) {
        let me = this;
        let list = me['@{copy.list}'];
        let elements = State.get('@{stage.elements}');
        let update = false;
        if (list) {
            update = true;
            let selected = [];
            let index = 0, diffX = 0, diffY = 0;
            let hasSameXY = props => {
                for (let c of elements) {
                    if (c.props.x == props.x &&
                        c.props.y == props.y) {
                        return 1;
                    }
                }
                return 0;
            };
            let setXY = ({ props, ctrl }) => {
                if (index === 0) {
                    if (xy) {
                        diffX = xy.x - props.x;
                        diffY = xy.y - props.y;
                    } else {
                        let oldX = props.x;
                        let oldY = props.y;
                        let ref = {
                            x: oldX,
                            y: oldY
                        };
                        while (hasSameXY(ref)) {
                            ref.x += 20;
                            ref.y += 20;
                        }
                        if ((ref.x + props.width) < 0) {
                            ref.x = -props.width / 2;
                        }
                        if ((ref.y + props.height) < 0) {
                            ref.y = -props.height / 2
                        }
                        while (hasSameXY(ref)) {
                            ref.x -= 4;
                            ref.y -= 4;
                        }
                        diffX = ref.x - props.x;
                        diffY = ref.y - props.y;
                    }
                }
                for (let x of ctrl.moved) {
                    props[x.key] = props[x.key] + (x.use == 'x' ? diffX : diffY);
                }
                props.locked = false;
            };
            for (let m of list) {
                let nm = Clone(m);
                setXY(nm);
                index++;
                nm.id = Magix.guid('e_');
                elements.push(nm);
                selected.push(nm);
                if (me['@{is.cut}']) {
                    StageElements["@{delete.element.by.id}"](m.id, true);
                }
            }

            if (me['@{is.cut}']) {
                delete me['@{is.cut}'];
                delete me['@{copy.list}'];
            }
            State.fire('@{event#stage.elements.change}');
            StageSelectElements['@{set.all}'](selected);
        }
        return update;
    }
}