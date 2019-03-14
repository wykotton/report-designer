/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { State, Vframe, has as Has, MagixVDOM } from 'magix';
import Dragdrop from '../gallery/mx-dragdrop/index';
import Cursor from '../gallery/mx-pointer/cursor';
import DHistory from '../designer/history';
import Transform from '../util/transform';
import Converter from '../util/converter';
Magix.applyStyle('@designer.less');
const BaseIndex = {
    0: 1,
    2: 1,
    4: 1,
    6: 1,
    1: 2,
    5: 2,
    3: 3,
    7: 3
};
let WatchSelectElements = {};
State.on('@{event#stage.select.elements.change}', () => {
    for (let p in WatchSelectElements) {
        let vf = Vframe.byId(p);
        if (vf) {
            vf.invoke('@{check.status}');
            vf.invoke('render');
        }
    }
});
export default Magix.View.extend({
    tmpl: '@designer.html',
    mixins: [Dragdrop],
    ctor(data) {
        this.assign(data);
        WatchSelectElements[this.id] = 1;
        this.on('destroy', () => {
            delete WatchSelectElements[this.id];
        });
    },
    '@{check.status}'() {
        let map = State.get('@{stage.select.elements.map}');
        let elements = State.get('@{stage.select.elements}');
        let count = elements.length;
        let data = this.get();
        let id = data.element.id;
        // if (data.selected) {
        //     if (!Has(map, id)) {
        //         let vf = Vframe.get('entity_' + this.id);
        //         if (vf) {
        //             vf.invoke('@{lost.select}');
        //         }
        //     }
        // } else {
        //     if (Has(map, id)) {
        //         let vf = Vframe.get('entity_' + this.id);
        //         if (vf) {
        //             vf.invoke('@{got.select}');
        //         }
        //     }
        // }
        this.set({
            selected: Has(map, id),
            count
        });
    },
    assign(data) {
        this.set(data);
        this['@{check.status}']();
        return true;
    },
    render() {
        this.digest();
    },
    '@{update}'(element) {
        this.digest({
            element,
            onlyMove: false
        });
    },
    '@{start.rotate}<mousedown>'(e: Magix5.MagixMouseEvent) {
        e.stopPropagation();
        let me = this;
        let element = me.get('element');
        let props = element.props;
        State.fire('@{event#stage.toggle.scroll}', {
            show: 1
        });
        let c = {
            x: props.x + props.width / 2,
            y: props.y + props.height / 2
        };
        let pos = Converter["@{real.to.stage.coord}"]({
            x: e.pageX,
            y: e.pageY
        });
        let rotate = props.rotate;
        let sdeg = Math.atan2(pos.y - c.y, pos.x - c.x) - rotate * Math.PI / 180,
            moved = false;
        me['@{drag.drop}'](e, (evt) => {
            if (!moved) {
                Cursor["@{show}"](e.eventTarget);
            }
            moved = true;
            pos = Converter["@{real.to.stage.coord}"]({
                x: evt.pageX,
                y: evt.pageY
            });
            let deg = Math.atan2(pos.y - c.y, pos.x - c.x);
            deg = (deg - sdeg) * 180 / Math.PI;
            props.rotate = (360 + (deg | 0)) % 360;
            this.digest({
                element,
                onlyMove: true
            });
            State.fire('@{event#stage.select.element.props.change}');
        }, () => {
            Cursor["@{hide}"]();
            if (moved) {
                DHistory["@{save}"]();
            }
            State.fire('@{event#stage.toggle.scroll}');
        });
    },
    '@{start.resize}<mousedown>'(e: Magix5.MagixMouseEvent) {
        if (e.button) return;
        e.stopPropagation();
        let me = this;
        let element = me.get('element');
        let { props, ctrl } = element;
        State.fire('@{event#stage.toggle.scroll}', {
            show: 1
        });
        let rotate = props.rotate || 0;
        let { key } = e.params;
        rotate = (rotate + 360) % 360;
        if (props.width == 0) props.width = 0.01;
        if (props.height == 0) props.height = 0.01;
        let beginWidth = props.width;
        let beginHeight = props.height;
        let beginX = props.x;
        let beginY = props.y;
        let minWidth = 0, minHeight = 0,
            maxWidth = Number.MAX_VALUE, maxHeight = Number.MAX_VALUE;
        for (let p of ctrl.props) {
            if (p.key == 'width') {
                if (Magix.has(p, 'max')) {
                    maxWidth = p.max;
                }
                if (Magix.has(p, 'min')) {
                    minWidth = p.min;
                }
            } else if (p.key == 'height') {
                if (Magix.has(p, 'max')) {
                    maxHeight = p.max;
                }
                if (Magix.has(p, 'min')) {
                    minHeight = p.min;
                }
            }
        }
        let transformedRect = Transform["@{rotate.rect}"](props, rotate);
        // 获取当前点和对角线点
        let pointAndOpposite = Transform["@{get.point.and.opposite}"](transformedRect.point, key);

        let { opposite, current } = pointAndOpposite;
        // 对角线点的索引即为缩放基点索引
        let baseIndex = opposite.index;

        let oppositePoint: any = opposite.point;
        let currentPoint: any = current.point
        let oppositeX = oppositePoint.x;
        let oppositeY = oppositePoint.y;

        // 鼠标释放点距离当前点对角线点的偏移量
        let offsetWidth = Math.abs(currentPoint.x - oppositeX);
        let offsetHeight = Math.abs(currentPoint.y - oppositeY);
        let oPoint = {
            x: beginX,
            y: beginY,
            rotate,
            width: beginWidth,
            height: beginHeight
        };
        let ex = e.pageX, ey = e.pageY;
        let moved = false;
        me['@{drag.drop}'](e, evt => {
            if (!moved) {
                Cursor["@{show}"](e.eventTarget);
            }
            let scale = {
                x: 1, y: 1
            };
            moved = true;
            let useX = offsetWidth > offsetHeight;
            let realScale = 1;
            let oX = evt.pageX - ex;
            let oY = evt.pageY - ey;
            if (baseIndex == 0 || baseIndex == 7) {
                if (useX && rotate > 90 && rotate < 270) {
                    oX = -oX;
                } else if (!useX && rotate > 180 && rotate < 360) {
                    oY = -oY;
                }
            } else if (baseIndex == 0 || baseIndex == 1) {
                if (useX && rotate > 45 && rotate < 135) {
                    oX = -oX;
                } else if (!useX && rotate > 90 && rotate < 270) {
                    oY = -oY;
                }
            }
            if (useX) {
                realScale = (oX + offsetWidth) / offsetWidth;
            } else {
                realScale = (oY + offsetHeight) / offsetHeight;
            }
            if (realScale < 0) realScale = 0;
            let m = BaseIndex[baseIndex];
            if (m === 1) {
                scale.x = scale.y = realScale;
            } else if (m === 2) {
                scale.y = realScale;
            } else if (m === 3) {
                scale.x = realScale;
            }
            let newRect = Transform["@{get.new.rect}"](oPoint, scale, transformedRect, baseIndex);
            let width = newRect.width,
                height = newRect.height;
            if (width < minWidth) {
                width = minWidth;
            } else if (width > maxWidth) {
                width = maxWidth;
            }
            if (height < minHeight) {
                height = minHeight;
            } else if (height > maxHeight) {
                height = maxHeight;
            }
            if (width != props.width ||
                height != props.height) {
                props.x = newRect.left;
                props.y = newRect.top;
                props.width = width;
                props.height = height;
                me.digest({
                    element,
                    onlyMove: false
                });
                State.fire('@{event#stage.select.element.props.change}');
            }
        }, () => {
            if (moved) {
                DHistory["@{save}"]();
                Cursor["@{hide}"]();
            }
            State.fire('@{event#stage.toggle.scroll}');
        });
    }
});