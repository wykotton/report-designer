import Magix, { node, State } from 'magix';
import Dragdrop from '../gallery/mx-dragdrop/index';
import Runner from '../gallery/mx-runner/index';
import Const from './const';
import DHistory from './history';
import StageElements from './stage-elements';
export default {
    '@{start.listen}'(scrollNode: HTMLElement, stageId) {
        let hoverInfo = null;
        let lastHoverNode = null;
        let barStyle = null;
        let outerBound = null;
        let lastPosition = null;
        let me = this;
        let stageScrolling = 0;
        let scrollListened = 0;
        let moveEvent = null;
        let elementsTree = null;
        let clearInfo = () => {
            lastHoverNode = null;
            outerBound = null;
            hoverInfo = null;
            lastPosition = null;
        };
        let scrollIfNeed = () => {
            let bound = scrollNode.getBoundingClientRect();
            let horScroll = scrollNode.scrollWidth > scrollNode.clientWidth + Const["@{dragdrop.stage.scroll.oversize}"];
            let verScroll = scrollNode.scrollHeight > scrollNode.clientHeight + Const["@{dragdrop.stage.scroll.oversize}"];
            let inScroll = moveEvent.pageY > bound.top &&
                moveEvent.pageY < bound.top + bound.height &&
                moveEvent.pageX > bound.left &&
                moveEvent.pageX < bound.left + bound.width;
            if (inScroll && (horScroll || verScroll)) {
                if ((bound.top + bound.height - Const["@{dragdrop.stage.near.ver.edge}"]) < moveEvent.pageY) {
                    if ((scrollNode.scrollTop + scrollNode.clientHeight + Const["@{dragdrop.stage.scroll.oversize}"]) < scrollNode.scrollHeight) {
                        stageScrolling++;
                        if (stageScrolling > Const["@{dragdrop.scroll.delay.count}"]) {
                            barStyle.display = 'none';
                            clearInfo();
                            scrollNode.scrollTop += Const["@{dragdrop.stage.scroll.step}"];
                        }
                    } else {
                        stageScrolling = 0;
                    }
                } else if (bound.top + Const["@{dragdrop.stage.near.ver.edge}"] > moveEvent.pageY) {
                    if (scrollNode.scrollTop < Const["@{dragdrop.stage.scroll.oversize}"]) {
                        stageScrolling = 0;
                    } else {
                        stageScrolling++;
                        if (stageScrolling > Const["@{dragdrop.scroll.delay.count}"]) {
                            clearInfo();
                            scrollNode.scrollTop -= Const["@{dragdrop.stage.scroll.step}"];
                            barStyle.display = 'none';
                        }
                    }
                } else if (bound.left + Const["@{dragdrop.stage.near.hor.edge}"] > moveEvent.pageX) {
                    if (scrollNode.scrollLeft < Const["@{dragdrop.stage.scroll.oversize}"]) {
                        stageScrolling = 0;
                    } else {
                        stageScrolling++;
                        if (stageScrolling > Const["@{dragdrop.scroll.delay.count}"]) {
                            clearInfo();
                            scrollNode.scrollLeft -= Const["@{dragdrop.stage.scroll.step}"];
                            barStyle.display = 'none';
                        }
                    }
                } else if ((bound.left + bound.width - Const["@{dragdrop.stage.near.hor.edge}"]) < moveEvent.pageX) {
                    if ((scrollNode.scrollLeft + scrollNode.clientWidth + Const["@{dragdrop.stage.scroll.oversize}"]) < scrollNode.scrollWidth) {
                        stageScrolling++;
                        if (stageScrolling > Const["@{dragdrop.scroll.delay.count}"]) {
                            barStyle.display = 'none';
                            clearInfo();
                            scrollNode.scrollLeft += Const["@{dragdrop.stage.scroll.step}"];
                        }
                    } else {
                        stageScrolling = 0;
                    }
                } else {
                    stageScrolling = 0;
                }
            } else {
                stageScrolling = 0;
            }
        };
        let startScroll = () => {
            if (!scrollListened) {
                scrollListened = 1;
                elementsTree = StageElements["@{elements.tree.map}"]();
                Runner["@{task.add}"](Const["@{dragdrop.stage.check.interval}"], scrollIfNeed);
            }
        };
        let stopScroll = () => {
            stageScrolling = 0;
            if (scrollListened) {
                scrollListened = 0;
                Runner["@{task.remove}"](scrollIfNeed);
            }
        };
        let addElements = e => {
            stopScroll();
            if (lastPosition) {
                barStyle.display = 'none';
                if (hoverInfo.moved) {
                    StageElements["@{move.element}"](lastPosition, hoverInfo.moved);
                } else {
                    StageElements["@{add.element}"](lastPosition);
                }
                State.fire('@{event#stage.elements.change}');
                DHistory["@{save}"]();
            }
            clearInfo();
            elementsTree = null;
        };
        let findPlace = e => {
            moveEvent = e;
            startScroll();
            if (stageScrolling) return;
            let n = Dragdrop["@{from.point}"](e.clientX, e.clientY);
            if (n != lastHoverNode) {
                lastHoverNode = n;
                if (!barStyle) {
                    barStyle = node(stageId + '_bar').style;
                }
                if (!outerBound) {
                    outerBound = node('stage_outer').getBoundingClientRect();
                }
                let i = me["@{find.best.place.info}"](elementsTree, n, e.moved);
                if (i) {
                    hoverInfo = i;
                } else {
                    hoverInfo = null;
                }
            }
            if (hoverInfo) {
                let pos = me["@{find.over.position}"](hoverInfo, e);
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
        State.on('@{event#toolbox.drag.hover.change}', findPlace);
        State.on('@{event#toolbox.drag.element.drop}', addElements);
    },
    '@{find.over.position}'(info, { pageY }) {
        let isSub = false;
        let { entity, subIndex, ctrl, moved } = info;
        if (moved && info.role != 'stage') {
            let walk = e => {
                if (e.id == entity.id) {
                    isSub = true;
                } else {
                    if (e.role == 'layout') {
                        for (let c of e.props.columns) {
                            for (let x of c.elements) {
                                walk(x);
                                if (isSub) {
                                    break;
                                }
                            }
                            if (isSub) {
                                break;
                            }
                        }
                    }
                }
            };
            walk(moved);
        }
        if (isSub) return;
        let bound = (info.layout || info.node as HTMLDivElement).getBoundingClientRect();
        let rect = {
            left: bound.left,
            top: bound.top,
            width: bound.width,
            height: bound.height
        };
        if (info.role == 'stage') {
            let count = info.elements.length;
            if (count) {
                rect.top += rect.height;
            }
            return {
                ctrl: info.ctrl,
                elements: info.elements,
                index: count,
                rect
            };
        } else if (info.role == 'layout') {
            let index = info.index,
                toIndex = index;
            if ((rect.top + rect.height / 2) < pageY) {
                rect.top += rect.height;
                index++;
                toIndex++
            } else {
                toIndex--;
            }
            let to = info.ownerList[toIndex];
            if (to && moved && to.id == moved.id) {
                return null;
            }
            return {
                ctrl: info.ctrl,
                elements: info.ownerList,
                index,
                rect
            }
        } else if (info.role == 'column') {
            let index = info.index, toIndex = index;
            let nearTop = rect.top + Const["@{dragdrop.column.near.edge}"] >= pageY;
            let nearBottom = rect.top + rect.height - Const["@{dragdrop.column.near.edge}"] <= pageY;
            if (nearBottom) {
                index++;
                toIndex++;
                rect.top += rect.height;
            } else {
                toIndex--;
            }
            if (nearTop || nearBottom) {
                let to = info.ownerList[toIndex];
                if (to && moved && to.id == moved.id) {
                    return null;
                }
                return {
                    ctrl: info.ctrl,
                    elements: info.ownerList,
                    index,
                    rect
                }
            }
            bound = info.node.getBoundingClientRect();
            rect = {
                left: bound.left,
                top: bound.top,
                width: bound.width,
                height: bound.height
            };
            nearTop = rect.top + Const["@{dragdrop.column.near.edge}"] >= pageY;
            let col = entity.props.columns[subIndex];
            let elements = col.elements,
                count = elements.length,
                e;
            if (count) {
                if (nearTop) {
                    index = 0;
                    e = elements[0];
                } else {
                    index = count;
                    e = elements[count - 1];
                }
                if (moved && moved.id == e.id) {
                    return;
                }
                bound = node(e.id).getBoundingClientRect();
                rect = {
                    left: bound.left,
                    top: bound.top + (nearTop ? 0 : bound.height),
                    width: bound.width,
                    height: bound.height
                };
            } else {
                index = 0;
            }
            return {
                elements,
                ctrl,
                index,
                rect
            }
        } else {
            let index = info.index,
                toIndex = index;
            if ((rect.top + rect.height / 2) < pageY) {
                rect.top += rect.height;
                index++;
                toIndex++;
            } else {
                toIndex--;
            }
            let to = info.ownerList[toIndex];
            if (to && moved && to.id == moved.id) {
                return null;
            }
            return {
                ctrl: info.ctrl,
                elements: info.ownerList,
                index,
                rect
            }
        }
    },
    '@{find.best.place.info}'(elementsTree, hover, moved) {
        let ctrl = State.get('@{memory.cache.element.ctrl}');
        let stage = node('stage_canvas');
        if ((ctrl || moved) && Magix.inside(hover, stage)) {
            let layouts = State.get('@{stage.layouts}');
            if (hover == stage) {
                let last = layouts[layouts.length - 1],
                    lastNode = stage;
                if (moved && last.id == moved.id) {
                    return;
                }
                if (last) {
                    lastNode = node(last.id);
                }
                return {
                    moved,
                    elements: layouts,
                    ctrl,
                    role: 'stage',
                    node: lastNode
                }
            } else {
                let role = '';
                do {
                    role = hover.getAttribute('role');
                    if (role) {
                        break;
                    }
                    hover = hover.parentNode;
                } while (hover != stage);
                if (role) {
                    let entityId = hover.getAttribute(role == 'column' ? 'pid' : 'eid');
                    let { entity, pInfo } = StageElements["@{find.best.element.by.id}"](elementsTree, entityId);
                    if (moved && moved.id == entity.id) {
                        return;
                    }
                    if (entity.props.locked) {
                        hover = node(entity.id);
                        role = hover.getAttribute('role');
                    }
                    let subIndex = -1, layout = null;
                    if (role == 'column') {
                        subIndex = hover.getAttribute('index') | 0;
                        layout = hover;
                        while (layout != stage) {
                            if (layout.getAttribute('role') == 'layout') {
                                break;
                            }
                            layout = layout.parentNode;
                        }
                    }
                    return {
                        ctrl,
                        role,
                        moved,
                        subIndex,
                        layout,
                        entity: entity,
                        index: pInfo.index,
                        ownerList: pInfo.elements,
                        node: hover
                    };
                }
            }
        }
        return null;
    }
};