/*
    author:xinglie.lkf@alibaba-inc.com
*/
'ref@toolbar.less';
import Magix, { State, node, Vframe } from 'magix';
import DHistory from './history';
export default Magix.View.extend({
    tmpl: '@toolbar-align.html',
    init() {
        let update = this.render.bind(this);
        State.on('@{event#history.shift}', update);
        State.on('@{event#stage.select.elements.change}', update);
    },
    render() {
        this.digest({
            elements: State.get('@{stage.select.elements}')
        });
    },
    '@{align.elements}<click>'(e: Magix5.MagixMouseEvent) {
        if (e.eventTarget.classList.contains('@toolbar.less:toolbar-item-disabled')) {
            return;
        }
        let { to } = e.params;
        let elements = State.get('@{stage.select.elements}');
        let maxRight = -Number.MAX_SAFE_INTEGER;
        let minLeft = Number.MAX_SAFE_INTEGER;
        let minTop = Number.MAX_SAFE_INTEGER;
        let maxBottom = -Number.MAX_SAFE_INTEGER;
        let minVCenter = Number.MAX_SAFE_INTEGER;
        let minHCenter = Number.MAX_SAFE_INTEGER;
        for (let m of elements) {
            let n = node("mask_" + m.id);
            let bound = n.getBoundingClientRect();
            if (to == 'right') {
                if (bound.right > maxRight) {
                    maxRight = bound.right;
                }
            } else if (to == 'left') {
                if (bound.left < minLeft) {
                    minLeft = bound.left;
                }
            } else if (to == 'top') {
                if (bound.top < minTop) {
                    minTop = bound.top;
                }
            } else if (to == 'bottom') {
                if (bound.bottom > maxBottom) {
                    maxBottom = bound.bottom;
                }
            } else if (to == 'middle') {
                let half = (bound.bottom - bound.top) / 2;
                if ((bound.top + half) < minVCenter) {
                    minVCenter = bound.top + half;
                }
            } else if (to == 'center') {
                let half = (bound.right - bound.left) / 2;
                if ((bound.left + half) < minHCenter) {
                    minHCenter = bound.left + half;
                }
            }
        }
        let changed = 0;
        for (let m of elements) {
            let n = node('mask_' + m.id);
            let bound = n.getBoundingClientRect();
            let lChanged = 0,
                use = '',
                diff;
            if (to == 'right') {
                diff = maxRight - bound.right;
                if (diff != 0) {
                    changed = 1;
                    lChanged = 1;
                    use = 'x';
                }
            } else if (to == 'left') {
                diff = minLeft - bound.left;
                if (diff != 0) {
                    changed = 1;
                    lChanged = 1;
                    use = 'x';
                }
            } else if (to == 'top') {
                diff = minTop - bound.top;
                if (diff != 0) {
                    changed = 1;
                    lChanged = 1;
                    use = 'y';
                }
            } else if (to == 'bottom') {
                diff = maxBottom - bound.bottom;
                if (diff != 0) {
                    changed = 1;
                    lChanged = 1;
                    use = 'y';
                }
            } else if (to == 'middle') {
                diff = minVCenter - (bound.top + (bound.bottom - bound.top) / 2);
                if (diff != 0) {
                    changed = 1;
                    lChanged = 1;
                    use = 'y';
                }
            } else if (to == 'center') {
                diff = minHCenter - (bound.left + (bound.right - bound.left) / 2);
                if (diff != 0) {
                    changed = 1;
                    lChanged = 1;
                    use = 'x';
                }
            }
            if (lChanged) {
                let vf = Vframe.byNode(node(m.id));
                if (vf) {
                    for (let x of m.ctrl.moved) {
                        if (x.use == use) {
                            m.props[x.key] += diff;
                        }
                    }
                    if (vf.invoke('assign', [{ element: m }])) {
                        vf.invoke('render');
                    }
                }
            }
        }
        if (changed) {
            State.fire('@{event#stage.select.element.props.change}');
            DHistory["@{save}"]();
        }
    }
});