/*
    author:xinglie.lkf@alibaba-inc.com
*/
'ref@./toolbar.less';
import Magix, { State, Vframe, node } from 'magix';
import DHistory from './history';
let MaxNum = Number.MAX_SAFE_INTEGER;
let MinNum = Number.MIN_SAFE_INTEGER;
export default Magix.View.extend({
    tmpl: '@toolbar-space.html',
    init() {
        let update = this.render.bind(this);
        State.on('@{event#history.shift}', update);
        State.on('@{event#stage.select.elements.change}', update);
    },
    render() {
        let elements = State.get('@{stage.select.elements}');
        let hasBesizer = false;
        for (let e of elements) {
            if (e.type == 'bezier') {
                hasBesizer = true;
                break;
            }
        }
        this.digest({
            elements,
            bezier: hasBesizer
        });
    },
    '@{same.elements}<click>'(e: Magix5.MagixMouseEvent) {
        if (e.eventTarget.classList.contains('@toolbar.less:toolbar-item-disabled')) {
            return;
        }
        let { to } = e.params;
        let elements = State.get('@{stage.select.elements}');
        let maxWidth = MinNum,
            maxHeight = MinNum,
            minWidth = MaxNum,
            minHeight = MaxNum;
        for (let m of elements) {
            let props = m.props;
            if (props.width > maxWidth) {
                maxWidth = props.width;
            }
            if (props.width < minWidth) {
                minWidth = props.width;
            }
            if (props.height > maxHeight) {
                maxHeight = props.height;
            }
            if (props.height < minHeight) {
                minHeight = props.height;
            }
        }
        let changed = 0;
        for (let m of elements) {
            let props = m.props,
                lChanged = 0,
                temp;
            if (to == 'width') {
                temp = e.shiftKey ? minWidth : maxWidth;
                if (props.width != temp) {
                    lChanged = 1;
                    changed = 1;
                    props.width = temp;
                }
            } else {
                temp = e.shiftKey ? minHeight : maxHeight;
                if (props.height != temp) {
                    lChanged = 1;
                    changed = 1;
                    props.height = temp;
                }
            }
            if (lChanged) {
                let vf = Vframe.byNode(node(m.id));
                if (vf) {
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
    },
    '@{avg.elements}<click>'(e: Magix5.MagixMouseEvent) {
        if (e.eventTarget.classList.contains('@toolbar.less:toolbar-item-disabled')) {
            return;
        }
        let { to } = e.params;
        let elements = State.get('@{stage.select.elements}');
        let maxCX = MinNum,
            minCX = MaxNum,
            maxCY = MinNum,
            minCY = MaxNum,
            minTop = MaxNum,
            maxBottom = MinNum,
            minLeft = MaxNum,
            maxRight = MinNum,
            minTopBound, minLeftBound,
            maxRightBound, maxBottomBound,
            tempArray = [],
            shift = e.shiftKey;
        for (let m of elements) {
            let props = m.props;
            let mx = props.x + props.width / 2;
            let my = props.y + props.height / 2;
            let bound;
            if (mx > maxCX) {
                maxCX = mx;
            }
            if (mx < minCX) {
                minCX = mx;
            }
            if (my > maxCY) {
                maxCY = my;
            }
            if (my < minCY) {
                minCY = my;
            }
            if (shift) {
                bound = node('mask_' + m.id).getBoundingClientRect();
                let { left, top, right, bottom } = bound;
                if (left < minLeft) {
                    minLeft = left;
                    minLeftBound = bound;
                }
                if (right > maxRight) {
                    maxRight = right;
                    maxRightBound = bound;
                }
                if (top < minTop) {
                    minTop = top;
                    minTopBound = bound;
                }
                if (bottom > maxBottom) {
                    maxBottom = bottom;
                    maxBottomBound = bound;
                }
            }
            tempArray.push({
                m,
                mx,
                my,
                bound
            });
        }
        let sort;
        if (shift) {
            sort = to == 'ver' ? (a, b) => a.bound.top - b.bound.top : (a, b) => a.bound.left - b.bound.left;
        } else {
            sort = to == 'ver' ? (a, b) => a.my - b.my : (a, b) => a.mx - b.mx;
        }
        tempArray = tempArray.sort(sort);
        let changed = 0;
        if (shift) {
            let inner = 0,
                gap = 0,
                count = tempArray.length;
            if (to == 'ver') {
                if (minTopBound != maxBottomBound) {
                    count--;
                }
                for (let e of tempArray) {
                    if (e.bound != minTopBound && e.bound != maxBottomBound) {
                        inner += e.bound.height;
                    }
                }
                gap = (maxBottomBound.top - minTopBound.bottom - inner) / count;
            } else {
                if (minLeftBound != maxRightBound) {
                    count--;
                }
                for (let e of tempArray) {
                    if (e.bound != minLeftBound && e.bound != maxRightBound) {
                        inner += e.bound.width;
                    }
                }
                gap = (maxRightBound.left - minLeftBound.right - inner) / count;
            }
            let prev, diffed = 0;
            for (let e of tempArray) {
                let lChanged = 0, use, diff;
                if (to == 'ver') {
                    if (e.bound != minTopBound && e.bound != maxBottomBound) {
                        lChanged = 1;
                        let y = prev.bound.bottom + diffed + gap;
                        diff = y - e.bound.top;
                        diffed += diff;
                        use = 'y';
                    }
                } else {
                    if (e.bound != minLeftBound && e.bound != maxRightBound) {
                        lChanged = 1;
                        let x = prev.bound.right + diffed + gap;
                        diff = x - e.bound.left;
                        diffed += diff;
                        use = 'x';
                    }
                }
                if (lChanged) {
                    changed = 1;
                    let m = e.m;
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
                prev = e;
            }
        } else {
            let first = tempArray[0];
            let startIndex = 1;
            let endIndex = tempArray.length - 1;
            let count = endIndex;
            let prev = first.m;

            let avgY = (maxCY - minCY) / count;
            let avgX = (maxCX - minCX) / count;

            for (let i = startIndex; i < endIndex; i++) {
                let m = tempArray[i].m,
                    lChanged = 0,
                    use = '',
                    diff = 0;
                if (to == 'ver') {
                    let centerY = prev.props.y + prev.props.height / 2;
                    centerY += avgY;
                    centerY -= m.props.height / 2;
                    if (m.props.y != centerY) {
                        lChanged = 1;
                        diff = centerY - m.props.y;
                        use = 'y';
                    }
                } else {
                    let centerX = prev.props.x + prev.props.width / 2;
                    centerX += avgX;
                    centerX -= m.props.width / 2;
                    if (m.props.x != centerX) {
                        lChanged = 1;
                        diff = centerX - m.props.x;
                        use = 'x';
                    }
                }
                if (lChanged) {
                    changed = 1;
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
                prev = m;
            }
        }
        if (changed) {
            State.fire('@{event#stage.select.element.props.change}');
            DHistory["@{save}"]();
        }
    }
});