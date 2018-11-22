/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { node, State } from 'magix';
import Dragdrop from '../gallery/mx-dragdrop/index';
import DHistory from './history';
import Keys from './keys';
import { StageElements, StageSelectElements } from './workspace';
Magix.applyStyle('@stage.less');
export default Magix.View.extend({
    tmpl: '@stage.html',
    mixins: [Dragdrop],
    init() {
        let hoverInfo = null;
        let lastHoverNode = null;
        let barStyle = null;
        let outerBound = null;
        let lastPosition = null;
        let addElements = e => {
            if (lastPosition) {
                let barStyle = node(this.id + '_bar').style;
                barStyle.display = 'none';
                if (hoverInfo.moved) {
                    StageElements["@{move.element}"](lastPosition, hoverInfo.moved);
                } else {
                    StageElements["@{add.element}"](lastPosition);
                }
                State.fire('@{event#stage.elements.change}');
                DHistory["@{save}"]();
            }
            lastHoverNode = null;
            barStyle = null;
            outerBound = null;
            hoverInfo = null;
            lastPosition = null;
        };
        let updateElements = (e?: any) => {
            let layouts = State.get('@{stage.layouts}');
            if (e) {
                this.digest({
                    layouts
                });
            } else {
                this.set({
                    layouts
                });
            }
        };
        let updateStage = this.render.bind(this);
        let findPlace = e => {
            let n = Dragdrop["@{from.point}"](e.clientX, e.clientY);
            if (n != lastHoverNode) {
                lastHoverNode = n;
                if (!barStyle) {
                    barStyle = node(this.id + '_bar').style;
                }
                if (!outerBound) {
                    outerBound = node('stage_outer').getBoundingClientRect();
                }
                let i = StageElements["@{find.best.place.info}"](n, e.moved);
                if (i) {
                    hoverInfo = i;
                } else {
                    hoverInfo = null;
                }
            }
            if (hoverInfo) {
                let pos = StageElements["@{find.under.position}"](hoverInfo, e);
                if (pos) {
                    lastPosition = pos;
                    barStyle.left = pos.rect.left - outerBound.left + 'px';
                    barStyle.top = pos.rect.top - outerBound.top + 'px';
                    barStyle.width = pos.rect.width + 'px';
                    barStyle.display = 'block';
                } else {
                    lastPosition = null;
                    barStyle.display = 'none';
                }
            } else if (barStyle) {
                lastPosition = null;
                barStyle.display = 'none';
            }
        };
        State.on('@{event#history.shift}', updateStage);
        State.on('@{event#stage.page.change}', updateStage);
        State.on('@{event#toolbox.add.element}', addElements);
        State.on('@{event#toolbox.drag.element.drop}', addElements);
        State.on('@{event#stage.elements.change}', updateElements);
        State.on('@{event#toolbox.drag.hover.change}', findPlace);
        updateElements();
    },
    render() {
        let page = State.get('@{stage.page}');
        this.digest({
            scale: State.get('@{stage.scale}'),
            page
        });
    },
    '@{element.start.drag}<mousedown>'(e) {
        if (e.from != 'layout') {
            StageElements["@{select.or.move.elements}"](e, this);
        }
    },
    '@{stage.start.drag}<mousedown>'(e: Magix.DOMEvent) {
        let target = e.target as HTMLDivElement;
        if (target.id == 'stage_canvas' ||
            Magix.inside('stage_canvas', target)) {
            if (!(e.shiftKey || e.metaKey || e.ctrlKey)) {
                StageSelectElements["@{set}"]();
            }
        }
    },
    '@{stage.keydown}<keydown>'(e: Magix.DOMEvent) {
        if (e.metaKey || e.ctrlKey) {
            if (e.keyCode == Keys.Z) {
                e.preventDefault();
                if (e.shiftKey) {
                    DHistory["@{redo}"]();
                } else {
                    DHistory["@{undo}"]();
                }
            } else if (e.keyCode == Keys.Y) {
                e.preventDefault();
                DHistory["@{redo}"]();
            }
        } else {
            if (e.keyCode == Keys.TAB) {
                e.preventDefault();
                StageElements["@{handle.key.tab}"](e);
            } else if (e.keyCode == Keys.DELETE) {
                e.preventDefault();
                if (StageElements["@{delete.select.elements}"]()) {
                    State.fire('@{event#stage.elements.change}');
                    DHistory["@{save}"]();
                }
            }
        }
    },
    '@{prevent}<contextmenu>'(e: MouseEvent) {
        e.preventDefault();
    },
    '@{stage.active}<focusin>'(e: Magix.DOMEvent) {
        node(this.id).classList.remove('@index.less:stage-deactive');
    },
    '@{stage.deactive}<focusout>'() {
        node(this.id).classList.add('@index.less:stage-deactive');
    }
});