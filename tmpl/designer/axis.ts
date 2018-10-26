/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { node } from 'magix';
import DragDrop from '../gallery/mx-dragdrop/index';
import Cursor from './cursor';
Magix.applyStyle('@axis.less');
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
            xHelpers: [],
            yHelpers: []
        });
    },
    '@{rerender}'() {
        if (this['@{can.render}']) {
            let n = this['@{scroll.node}'];
            let width = n.scrollWidth + 50;
            let height = n.scrollHeight + 50;
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
            yStart = Math.round(offset.top - outerOffset.top /*- (page.header || 0)*/);
            yEnd = height - yStart;
            vHeight = n.offsetHeight;
            vWidth = n.offsetWidth;
            this.digest({
                sTop: n.scrollTop,
                sLeft: n.scrollLeft,
                width,
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
        let test = () => {
            let n = node('stage_canvas');
            if (n) {
                this['@{can.render}'] = 1;
                this['@{rerender}']();
            } else {
                setTimeout(test, 30);
            }
        };
        test();
    },
    '@{show.x.line}<mousemove>'(e) {
        let xNode = this['@{x.axis}'];
        let v = e.pageX;
        let start = this.get('xStart');
        let styles = this['@{x.line}'].style;
        styles.display = 'block';
        styles.left = v + 'px';
        let mm = v - start + xNode.scrollLeft;
        this['@{x.line.tip}'].innerHTML = mm;
    },
    '@{hide.x.line}<mouseout>'(e) {
        if (!Magix.inside(e.relatedTarget, e.eventTarget)) {
            this['@{x.line}'].style.display = 'none';
        }
    },
    '@{show.y.line}<mousemove>'(e) {
        let sTop = node(this.id).getBoundingClientRect();
        let v = e.pageY - sTop.top;
        let start = this.get('yStart');
        let yNode = this['@{y.axis}'];
        let styles = this['@{y.line}'].style;
        styles.display = 'block';
        styles.top = v + 'px';
        let mm = v - start - 20 + yNode.scrollTop;
        this['@{y.line.tip}'].innerHTML = mm;
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
        let mm = v - start + xNode.scrollLeft;
        let xHelpers = this.get('xHelpers');
        xHelpers.push({
            mm,
            id: Magix.guid('x_')
        });
        this.digest({
            xHelpers
        });
    },
    '@{add.y.help.line}<click>'(e) {
        let offset = node(this.id).getBoundingClientRect();
        let v = e.pageY - offset.top;
        let start = this.get('yStart');
        let yNode = this['@{y.axis}'];
        let mm = v - start - 20 + yNode.scrollTop;
        let yHelpers = this.get('yHelpers');
        yHelpers.push({
            mm,
            id: Magix.guid('x_')
        });
        this.digest({
            yHelpers
        });
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
            Cursor["@{show}"](e.eventTarget);
            this['@{drag.drop}'](e, (evt) => {
                let oft;
                if (type == 'x') {
                    oft = evt.pageX - e.pageX + current;
                } else {
                    oft = evt.pageY - e.pageY + current - 20;
                }
                item.mm = oft - start;
                this.digest({
                    [key]: list
                });
            }, () => {
                Cursor["@{hide}"]();
            });
        }
    },
    '$win<resize>'() {
        this['@{rerender}']();
    }
});