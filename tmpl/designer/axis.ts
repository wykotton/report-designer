/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { node, State } from 'magix';
import DragDrop from '../gallery/mx-dragdrop/index';
import Cursor from '../gallery/mx-pointer/cursor';
import DHistory from './history';
Magix.applyStyle('@axis.less');
let ScalesMap = {
    '1': {
        space: 100,
        step: 10
    }
};
export default Magix.View.extend({
    tmpl: '@axis.html',
    mixins: [DragDrop],
    init(data) {
        let n = node(data.scroll);
        n.addEventListener('scroll', () => {
            this['@{sync.scroll}']();
        }, {
                passive: true
            });
        this['@{scroll.node}'] = n;
        this.set({
            bar: 4,//普通条
            hbar: 12,//关键指示条,
            barColor: '#aaa'//颜色
        });
        let update = this.render.bind(this);
        State.on('@{event#history.shift}', update);
        State.on('@{event#stage.page.change}', update);
        State.on('@{event#stage.elements.change}', update);
    },
    '@{rerender}'() {
        if (this['@{can.render}']) {
            let n = this['@{scroll.node}'];
            let sa = State.get('@{stage.scale}');
            let width = Math.max(n.scrollWidth, window.innerWidth) + 500;
            let height = Math.max(n.scrollHeight, window.innerHeight) + 300;
            let xStart = 0;
            let xEnd = 0;
            let axisWidth = 20;
            let yStart = 0;
            let yEnd = 0;
            let vHeight = 10;
            let vWidth = 10;
            let stage = node('stage_canvas');
            let outer = node('stage_outer');
            let offset = stage.getBoundingClientRect();
            let outerOffset = outer.getBoundingClientRect();
            let left = Math.round(offset.left - outerOffset.left);
            xStart = left + axisWidth;
            xEnd = width - xStart;
            yStart = Math.round(offset.top - outerOffset.top);
            yEnd = height - yStart;
            vHeight = n.offsetHeight;
            vWidth = n.offsetWidth;
            let si = ScalesMap[sa];
            this.digest({
                sTop: n.scrollTop,
                sLeft: n.scrollLeft,
                width,
                scale: sa,
                space: si.space,
                step: si.step,
                height,
                xStart,
                xEnd,
                yStart,
                vHeight,
                vWidth,
                yEnd
            }, null, () => {
                this['@{x.axis}'] = node(this.id + '_x');
                this['@{y.axis}'] = node(this.id + '_y');
                this['@{x.line}'] = node(this.id + '_x_line');
                this['@{y.line}'] = node(this.id + '_y_line');
                this['@{x.line.tip}'] = node(this.id + '_x_tip');
                this['@{y.line.tip}'] = node(this.id + '_y_tip');
                this['@{x.axis.help}'] = node(this.id + '_x_help');
                this['@{y.axis.help}'] = node(this.id + '_y_help');
            });
        }
    },
    '@{sync.scroll}'() {
        let xNode = this['@{x.axis}'];
        let yNode = this['@{y.axis}'];
        let yHelpNode = this['@{y.axis.help}'];
        let xHelpNode = this['@{x.axis.help}'];
        let scroll = this['@{scroll.node}'];
        let top = scroll.scrollTop;
        let left = scroll.scrollLeft;
        if (xNode) {
            xNode.scrollLeft = left;
        }
        if (yNode) {
            yNode.scrollTop = top;
        }
        if (xHelpNode) {
            xHelpNode.style.left = -left + 'px';
        }
        if (yHelpNode) {
            yHelpNode.style.top = -top + 'px';
        }
        this.set({
            sLeft: left,
            sTop: top
        });
    },
    render() {
        this.set({
            xHelpers: State.get('@{stage.x.help.lines}'),
            yHelpers: State.get('@{stage.y.help.lines}')
        });
        let test = () => {
            let n = node('stage_canvas');
            if (n) {
                this['@{can.render}'] = 1;
                this['@{rerender}']();
            } else {
                setTimeout(test, 30);
            }
        };
        setTimeout(test, 30);
    },
    '@{show.x.line}<mousemove>'(e) {
        let xNode = this['@{x.axis}'];
        let v = e.pageX;
        let start = this.get('xStart');
        let styles = this['@{x.line}'].style;
        styles.display = 'block';
        styles.left = v + 'px';
        let mm = v - start + xNode.scrollLeft;
        let scale = this.get('scale');
        this['@{x.line.tip}'].innerHTML = (mm / scale).toFixed(0);
    },
    '@{hide.x.line}<mouseout>'(e) {
        if (!Magix.inside(e.relatedTarget, e.eventTarget)) {
            this['@{x.line}'].style.display = 'none';
        }
    },
    '@{show.y.line}<mousemove>'(e) {
        let sTop = this.root.getBoundingClientRect();
        let v = e.pageY - sTop.top;
        let start = this.get('yStart');
        let yNode = this['@{y.axis}'];
        let styles = this['@{y.line}'].style;
        styles.display = 'block';
        styles.top = v + 'px';
        let mm = v - start - 20 + yNode.scrollTop;
        let scale = this.get('scale');
        this['@{y.line.tip}'].innerHTML = (mm / scale).toFixed(0);
    },
    '@{hide.y.line}<mouseout>'(e) {
        if (!Magix.inside(e.relatedTarget, e.eventTarget)) {
            this['@{y.line}'].style.display = 'none';
        }
    },
    '@{add.x.help.line}<click>'(e) {
        let v = e.pageX;
        let start = this.get('xStart');
        let xNode = this['@{x.axis}'];
        let mm = ((v - start + xNode.scrollLeft) / this.get('scale')) | 0;
        let xHelpers = this.get('xHelpers');
        xHelpers.push({
            mm,
            id: Magix.guid('x_')
        });
        this.digest({
            xHelpers
        });
        DHistory["@{save}"]();
    },
    '@{add.y.help.line}<click>'(e) {
        let offset = this.root.getBoundingClientRect();
        let v = e.pageY - offset.top;
        let start = this.get('yStart');
        let yNode = this['@{y.axis}'];
        let mm = ((v - start - 20 + yNode.scrollTop) / this.get('scale')) | 0;
        let yHelpers = this.get('yHelpers');
        yHelpers.push({
            mm,
            id: Magix.guid('x_')
        });
        this.digest({
            yHelpers
        });
        DHistory["@{save}"]();
    },
    '@{delete.help.line}<click>'(e) {
        let { type, id } = e.params;
        let key = type + 'Helpers';
        let list = this.get(key);
        for (let i = list.length; i--;) {
            let e = list[i];
            if (e.id == id) {
                list.splice(i, 1);
                break;
            }
        }
        this.digest({
            [key]: list
        });
        DHistory["@{save}"]();
    },
    '@{drag.help.line}<mousedown>'(e) {
        if (e.target != e.eventTarget) {
            return;
        }
        let { type, id, c: current } = e.params;
        let key = type + 'Helpers';
        let list = this.get(key);
        let item;
        for (let i of list) {
            if (i.id == id) {
                item = i;
                break;
            }
        }
        if (item) {
            let start = this.get(type + 'Start');
            let showedCursor = 0;
            this['@{drag.drop}'](e, (evt) => {
                if (!showedCursor) {
                    showedCursor = 1;
                    Cursor["@{show}"](e.eventTarget);
                }
                let oft;
                if (type == 'x') {
                    oft = evt.pageX - e.pageX + current;
                } else {
                    oft = evt.pageY - e.pageY + current - 20;
                }
                item.mm = ((oft - start) / this.get('scale')) | 0;
                this.digest({
                    [key]: list
                });
            }, () => {
                if (showedCursor) {
                    Cursor["@{hide}"]();
                    DHistory["@{save}"]();
                }
            });
        }
    },
    '@{prevent}<contextmenu>'(e) {
        e.preventDefault();
    },
    '$win<resize>'() {
        this['@{rerender}']();
    }
});