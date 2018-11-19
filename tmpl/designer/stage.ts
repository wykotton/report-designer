/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { node, State, Vframe } from 'magix';
import Dragdrop from '../gallery/mx-dragdrop/index';
import DHistory from './history';
import Keys from './keys';
import { StageElements, StageSelectElements, Clipboard } from './workspace';
import Converter from '../util/converter';
import Select from '../gallery/mx-pointer/select';
import Cursor from '../gallery/mx-pointer/cursor';
import Menu from '../gallery/mx-menu/index';
import Contextmenu from './contextmenu';
Magix.applyStyle('@stage.less');
export default Magix.View.extend({
    tmpl: '@stage.html',
    mixins: [Dragdrop],
    init() {
        let addElements = e => {
            if (e.node) {
                if (Magix.inside(e.node, 'stage_canvas')) {
                    let p = Converter["@{real.to.stage.coord}"]({
                        x: e.pageX,
                        y: e.pageY
                    });
                    e.pageX = p.x;
                    e.pageY = p.y;
                } else {
                    return;
                }
            }
            let elements = StageElements["@{add.element}"](e, true);
            if (elements) {
                State.fire('@{event#stage.elements.change}');
                DHistory["@{save}"]();
            }
        };
        let updateElements = (e?: any) => {
            let columns = State.get('@{stage.columns}');
            if (e) {
                this.digest({
                    columns
                });
            } else {
                this.set({
                    columns
                });
            }
        };
        let updateStage = e => {
            if (e.step) {
                let columns = State.get('@{stage.columns}');
                if (e.step) {
                    for (let { elements } of columns) {
                        for (let { props } of elements) {
                            props.x *= e.step;
                            props.y *= e.step;
                            props.width *= e.step;
                            props.height *= e.step;
                        }
                    }
                }
                this.set({
                    columns
                });
            }
            this.render();
        };
        let togglePole = e => {
            let o = node(this.id);
            let p = node('pole_' + this.id);
            let ps = p.style;
            if (e.show) {
                ps.width = o.scrollWidth + 'px';
                ps.height = o.scrollHeight + 'px';
                ps.display = 'block';
            } else {
                ps.display = 'none';
            }
        };
        State.on('@{event#history.shift}', updateStage);
        State.on('@{event#stage.scale.change}', updateStage);
        State.on('@{event#stage.page.change}', updateStage);
        State.on('@{event#toolbox.add.element}', addElements);
        State.on('@{event#toolbox.drag.element.drop}', addElements);
        State.on('@{event#stage.elements.change}', updateElements);
        State.on('@{event#stage.lock.scroll}', togglePole);
        updateElements();
    },
    render() {
        let page = State.get('@{stage.page}');
        let cols = page.mode.split(' ');
        let columns = State.get('@{stage.columns}');
        for (let i = 0; i < cols.length; i++) {
            if (!columns[i]) {
                columns[i] = {
                    width: cols[i],
                    elements: []
                };
            } else {
                columns[i].width = cols[i];
            }
        }
        let first = columns[0].elements;
        if (columns.length > cols.length) {
            for (let i = columns.length; i-- > cols.length;) {
                first.push.apply(columns[0].elements);
            }
            columns.splice(cols.length, columns.length - cols.length);
        }
        this.digest({
            columns,
            scale: State.get('@{stage.scale}'),
            page
        });
    },
    '@{element.start.drag}<mousedown>'(e) {
        StageElements["@{select.or.move.elements}"](e, this);
    },
    '@{stage.start.drag}<mousedown>'(e: Magix.DOMEvent) {
        let target = e.target as HTMLDivElement;
        if (target.id == 'stage_canvas' ||
            target.hasAttribute('col') ||
            Magix.inside('stage_canvas', target)) {
            let bak = null, count = 0;
            let last = State.get('@{stage.select.elements.map}');
            if (!e.shiftKey) {
                StageSelectElements["@{set}"]();
            } else {
                bak = {};
                let old = State.get('@{stage.select.elements}');
                for (let e of old) {
                    bak[e.id] = 1;
                    count++;
                }
            }
            let page = State.get('@{stage.page}');
            if (page.mode != 'auto') return;
            this['@{last.intereset.count}'] = count;
            Select["@{init}"]();
            let showedCursor = 0;
            let elementLocations = StageElements["@{get.elements.location}"]();
            this['@{drag.drop}'](e, ex => {
                if (!showedCursor) {
                    showedCursor = 1;
                    Cursor["@{show.by.type}"]('default');
                }
                let width = Math.abs(e.pageX - ex.pageX);
                let height = Math.abs(e.pageY - ex.pageY);
                let left = Math.min(e.pageX, ex.pageX);
                let top = Math.min(e.pageY, ex.pageY);
                Select["@{update}"](left, top, width, height);
                let rect = Converter["@{real.to.stage.coord}"]({
                    x: left,
                    y: top
                }) as {
                        x: number
                        y: number
                        width: number
                        height: number
                    };
                rect.width = width;
                rect.height = height;
                if (elementLocations.length) {
                    let intersectElements = StageElements["@{get.intersect.elements}"](elementLocations, rect, bak);
                    let count = intersectElements.length;
                    if (count !== this['@{last.intereset.count}']) {
                        this['@{last.intereset.count}'] = count;
                        StageSelectElements["@{set.all}"](intersectElements);
                    }
                }
            }, () => {
                if (showedCursor) {
                    Select["@{hide}"]();
                    Cursor["@{hide}"]();
                }
                if (StageSelectElements["@{has.changed}"](last)) {
                    DHistory["@{save}"]();
                }
            });
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
            } else if (e.keyCode == Keys.A) {
                e.preventDefault();
                StageElements["@{select.all}"]();
            } else if (e.keyCode == Keys.X) {
                e.preventDefault();
                Clipboard["@{cut.elements}"]();
            } else if (e.keyCode == Keys.C) {
                e.preventDefault();
                Clipboard["@{copy.elements}"]();
            } else if (e.keyCode == Keys.V) {
                e.preventDefault();
                Clipboard["@{paste.elements}"]();
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
            } else {
                let step = e.shiftKey ? 10 : 1;
                step *= State.get('@{stage.scale}');
                let selectElements = State.get('@{stage.select.elements}');
                if (selectElements.length) {
                    let propsChanged = false;
                    for (let m of selectElements) {
                        if (!m.props.locked) {
                            if (e.keyCode == Keys.UP) {
                                propsChanged = true;
                                m.props.y -= step;
                            } else if (e.keyCode == Keys.DOWN) {
                                propsChanged = true;
                                m.props.y += step;
                            } else if (e.keyCode == Keys.LEFT) {
                                propsChanged = true;
                                m.props.x -= step;
                            } else if (e.keyCode == Keys.RIGHT) {
                                propsChanged = true;
                                m.props.x += step;
                            }
                            if (propsChanged) {
                                let vf = Vframe.get(m.id);
                                if (vf) {
                                    if (vf.invoke('assign', [{ element: m }])) {
                                        vf.invoke('render');
                                    }
                                }
                            }
                        }
                    }
                    if (propsChanged) {
                        e.preventDefault();
                        State.fire('@{event#stage.select.element.props.change}');
                        DHistory["@{save}"]('@{history#move.element.by.keyboard}', 500);
                    }
                }
            }
        }
    },
    '@{prevent}<contextmenu>'(e: MouseEvent) {
        e.preventDefault();
        if (Magix.inside(e.target as HTMLElement, 'stage_canvas')) {
            let lang = Magix.config('lang');
            let list = Contextmenu.stage(lang);
            let disabled = {};
            let stageElements = State.get('@{stage.elements}');
            let selectElements = State.get('@{stage.select.elements}');
            let hasElements = Clipboard["@{has.elements}"]();
            disabled[Contextmenu.allId] = !stageElements.length;
            disabled[Contextmenu.pasteId] = !hasElements;
            let selectCount = selectElements.length;
            let element = selectElements[0];
            if (selectCount == 1) {
                list = Contextmenu.singleElement(lang);
                let topElement = stageElements[stageElements.length - 1];
                let bottomElement = stageElements[0];
                let atTop = topElement.id == element.id;
                let atBottom = bottomElement.id == element.id;
                let locked = element.props.locked;
                disabled[Contextmenu.cutId] = locked;
                disabled[Contextmenu.upId] = locked || atTop;
                disabled[Contextmenu.topId] = locked || atTop;
                disabled[Contextmenu.bottomId] = locked || atBottom;
                disabled[Contextmenu.downId] = locked || atBottom;
            } else if (selectCount > 1) {
                list = Contextmenu.multipleElement(lang);
            }
            Menu.show(this, e, {
                list: list,
                disabled,
                picked(menu) {
                    if (menu.id == Contextmenu.allId) {
                        StageElements["@{select.all}"]();
                    } else if (menu.id == Contextmenu.copyId) {
                        Clipboard["@{copy.elements}"]();
                    } else if (menu.id == Contextmenu.pasteId) {
                        let p = Converter["@{real.to.stage.coord}"]({
                            x: e.pageX,
                            y: e.pageY
                        });
                        if (Clipboard["@{paste.elements}"](p)) {
                            DHistory["@{save}"]();
                        }
                    } else if (menu.id == Contextmenu.cutId) {
                        Clipboard["@{cut.elements}"]();
                    } else if (menu.id == Contextmenu.deleteId) {
                        if (StageElements["@{delete.select.elements}"]()) {
                            State.fire('@{event#stage.elements.change}');
                            DHistory["@{save}"]();
                        }
                    } else if (menu.id >= 3 && menu.id <= 6) {
                        if (StageElements["@{move.element}"](menu.id, element)) {
                            State.fire('@{event#stage.elements.change}');
                            DHistory["@{save}"]();
                        }
                    }
                }
            });
        }
    },
    '@{stage.active}<focusin>'(e: Magix.DOMEvent) {
        node(this.id).classList.remove('@index.less:stage-deactive');
    },
    '@{stage.deactive}<focusout>'() {
        node(this.id).classList.add('@index.less:stage-deactive');
    }
});