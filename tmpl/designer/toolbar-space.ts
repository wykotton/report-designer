/*
    author:xinglie.lkf@alibaba-inc.com
*/
'ref@./toolbar.less';
import Magix, { State, Vframe, node } from 'magix';
import DHistory from './history';
export default Magix.View.extend({
    tmpl: '@toolbar-space.html',
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
    '@{same.elements}<click>'(e: Magix5.MagixMouseEvent) {
        if (e.eventTarget.classList.contains('@toolbar.less:toolbar-item-disabled')) {
            return;
        }
        let { to } = e.params;
        let elements = State.get('@{stage.select.elements}');
        let maxWidth = -Number.MAX_SAFE_INTEGER,
            maxHeight = -Number.MAX_SAFE_INTEGER,
            minWidth = Number.MAX_SAFE_INTEGER,
            minHeight = Number.MAX_SAFE_INTEGER;
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
        let maxCX = -Number.MAX_SAFE_INTEGER,
            minCX = Number.MAX_SAFE_INTEGER,
            maxCY = -Number.MAX_SAFE_INTEGER,
            minCY = Number.MAX_SAFE_INTEGER,
            tempArray = [];
        for (let m of elements) {
            let props = m.props;
            let mx = props.x + props.width / 2;
            let my = props.y + props.height / 2;
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
            tempArray.push({
                m,
                mx,
                my
            });
        }
        if (to == 'ver') {
            tempArray = tempArray.sort((a, b) => a.my - b.my);
        } else {
            tempArray = tempArray.sort((a, b) => a.mx - b.mx);
        }

        let first = tempArray[0];
        let startIndex = 1;
        let endIndex = tempArray.length - 1;
        let count = endIndex;
        let prev = first.m;
        let changed = 0;

        let avgY = (maxCY - minCY) / count;
        let avgX = (maxCX - minCX) / count;

        for (let i = startIndex; i < endIndex; i++) {
            let m = tempArray[i].m,
                lChanged = 0;
            if (to == 'ver') {
                let centerY = prev.props.y + prev.props.height / 2;
                centerY += avgY;
                centerY -= m.props.height / 2;
                if (m.props.y != centerY) {
                    changed = 1;
                    lChanged = 1;
                    m.props.y = centerY;
                }
            } else {
                let centerX = prev.props.x + prev.props.width / 2;
                centerX += avgX;
                centerX -= m.props.width / 2;
                if (m.props.x != centerX) {
                    changed = 1;
                    lChanged = 1;
                    m.props.x = centerX;
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
            prev = m;
        }
        if (changed) {
            State.fire('@{event#stage.select.element.props.change}');
            DHistory["@{save}"]();
        }
    }
});