/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { node, State } from 'magix';
import Dragdrop from '../gallery/mx-dragdrop/index';
import DHistory from './history';
import Keys from './keys';
import { StageElements, StageSelectElements, StageDragDrop } from './workspace';
Magix.applyStyle('@stage.less');
export default Magix.View.extend({
    tmpl: '@stage.html',
    mixins: [Dragdrop],
    init() {
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

        State.on('@{event#history.shift}', updateStage);
        State.on('@{event#stage.page.change}', updateStage);
        State.on('@{event#stage.elements.change}', updateElements);
        updateElements();
        StageDragDrop["@{start.listen}"](this.root, this.id);
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
        if (Magix.inside(node('stage_canvas'), target)) {
            if (!(e.shiftKey || e.metaKey || e.ctrlKey)) {
                if (StageSelectElements["@{set}"]()) {
                    DHistory["@{save}"]();
                }
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
        this.root.classList.remove('@index.less:stage-deactive');
    },
    '@{stage.deactive}<focusout>'() {
        this.root.classList.add('@index.less:stage-deactive');
    }
});