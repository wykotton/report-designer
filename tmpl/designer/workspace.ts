import Magix, { State, toMap as ToMap, node } from 'magix';
import DHistory from './history';
import Follower from '../gallery/mx-pointer/follower';

export let StageSelectElements = {
    '@{set}'(element?: any) {
        let selectElements = State.get('@{stage.select.elements}');
        let oldCount = selectElements.length;
        if (oldCount || element) {
            let first = oldCount > 1 ? null : selectElements[0];
            selectElements.length = 0;
            let fireEvent = false;
            if (element) {
                selectElements.push(element);
                fireEvent = element != first;
            } else if (oldCount) {
                fireEvent = true;
            }
            if (fireEvent) {
                State.set({
                    '@{stage.select.elements.map}': ToMap(selectElements, 'id')
                });
                State.fire('@{event#stage.select.elements.change}');
                return true;
            }
        }
    },
    '@{add}'(element) {
        let selectElements = State.get('@{stage.select.elements}');
        let find = false;
        for (let e of selectElements) {
            if (e.id === element.id) {
                find = true;
                break;
            }
        }
        if (!find) {
            selectElements.push(element);
            State.set({
                '@{stage.select.elements.map}': ToMap(selectElements, 'id')
            });

            State.fire('@{event#stage.select.elements.change}');
            return true;
        }
    },
    '@{remove}'(element) {
        let selectElements = State.get('@{stage.select.elements}');
        let find = false, index = -1;
        for (let e of selectElements) {
            index++;
            if (e.id === element.id) {
                find = true;
                break;
            }
        }
        if (find) {
            selectElements.splice(index, 1);
            State.set({
                '@{stage.select.elements.map}': ToMap(selectElements, 'id')
            });

            State.fire('@{event#stage.select.elements.change}');
            return true;
        }
    },
    '@{set.all}'(elements?: any[]) {
        let selectElements = State.get('@{stage.select.elements}');
        selectElements.length = 0;
        if (elements) {
            selectElements.push.apply(selectElements, elements);
        }
        State.set({
            '@{stage.select.elements.map}': ToMap(selectElements, 'id')
        });
        State.fire('@{event#stage.select.elements.change}');
    },
    '@{has.changed}'(last) {
        let now = State.get('@{stage.select.elements.map}');
        let diff = 0;
        for (let p in last) {
            if (!now[p]) {
                diff = 1;
                break;
            }
        }
        if (!diff) {
            for (let p in now) {
                if (!last[p]) {
                    diff = 1;
                    break;
                }
            }
        }
        return diff;
    }
};

export let StageElements = {
    '@{add.element}'(e) {
        let ctrl = e.ctrl;
        let props = ctrl.getProps();
        let em = {
            id: Magix.guid('e_'),
            type: ctrl.type,
            role: ctrl.role,
            ctrl,
            props
        };
        e.elements.splice(e.index, 0, em);
        StageSelectElements["@{set}"](em);
    },
    '@{move.element}'(e, moved) {
        let walk = (elements, nullable?: boolean) => {
            let i = 0, find = false;
            for (let e of elements) {
                if (nullable && e == null) {
                    elements.splice(i, 1);
                    find = true;
                } else if (!nullable && e.id == moved.id) {
                    elements.splice(i, 1, null);
                    find = true;
                    break;
                } else if (e.role == 'layout') {
                    for (let c of e.props.columns) {
                        walk(c.elements, nullable);
                        if (find) break;
                    }
                }
                i++;
            }
        };
        let layouts = State.get('@{stage.layouts}');
        walk(layouts);
        e.elements.splice(e.index, 0, moved);
        walk(layouts, true);
    },
    '@{select.or.move.elements}'(event, view) {
        let { element } = event.params;
        let elements = State.get('@{stage.select.elements}');
        if (event.button !== undefined && event.button != 0) {//如果不是左键
            let exist = false;
            for (let m of elements) {
                if (m.id === element.id) {
                    exist = true;
                    break;
                }
            }
            if (!exist) {//如果在当前选中的元素内找不到当前的，则激活当前
                if (StageSelectElements['@{set}'](element)) {
                    DHistory["@{save}"]();
                }
            }
            return;
        }
        let exist = false;
        for (let e of elements) {
            if (element.id == e.id) {
                exist = true;
            }
        }
        if (!exist) {
            if (StageSelectElements['@{set}'](element)) {
                DHistory["@{save}"]();
            }
            elements.length = 0;
            elements.push(element);
        }
        let ctrl = element.ctrl;
        Follower["@{update}"](ctrl.icon);
        view['@{drag.drop}'](event, evt => {
            Follower["@{show}"](evt);
            State.fire('@{event#toolbox.drag.hover.change}', {
                pageX: evt.pageX,
                pageY: evt.pageY,
                clientX: evt.clientX,
                clientY: evt.clientY,
                moved: element
            });
        }, (ex) => {
            Follower["@{hide}"]();
            if (ex) {
                State.fire('@{event#toolbox.drag.element.drop}');
            }
        });
    },
    '@{delete.select.elements}'() {
        let selectElements = State.get('@{stage.select.elements}');
        let layouts = State.get('@{stage.layouts}');
        let update = false;
        if (selectElements.length) {
            let map = ToMap(selectElements, 'id');
            let walk = elements => {
                for (let i = elements.length, e; i--;) {
                    e = elements[i]
                    if (map[e.id]) {
                        update = true;
                        elements.splice(i, 1);
                    } else {
                        if (e.role == 'layout') {
                            for (let c of e.props.columns) {
                                walk(c.elements);
                            }
                        }
                    }
                }
            };
            walk(layouts);
            if (update) {
                StageSelectElements["@{set}"]();
            }
        }
        return update;
    },
    '@{handle.key.tab}'(e) {
        let selectElements = State.get('@{stage.select.elements}');
        let stageElements = State.get('@{stage.layouts}');
        if (stageElements.length) {
            //多选2个以上的我们取消多选，然后从头选择一个
            let c = selectElements.length;
            let current = selectElements[0];
            if (c === 0 || c > 1) {
                current = stageElements[e.shiftKey ? stageElements.length - 1 : 0];
                StageSelectElements["@{set}"](current);
            } else {
                let findCurrent = null,
                    findNext = null,
                    findPrev = null,
                    lastOne = null,
                    lockPrev = false,
                    id = current.id;
                let find = es => {
                    for (let e of es) {
                        if (e.id == id) {
                            lockPrev = true;
                            findCurrent = e;
                        } else {
                            if (findCurrent && !findNext) {
                                findNext = e;
                            } else if (!lockPrev) {
                                findPrev = e;
                            } else {
                                lastOne = e;
                            }
                        }
                        if (e.role == 'layout') {
                            for (let c of e.props.columns) {
                                find(c.elements);
                            }
                        }
                    }
                };
                find(stageElements);
                let select = null;
                if (e.shiftKey) {
                    if (!findPrev) {
                        select = stageElements[stageElements.length - 1];
                        if (select.role == 'layout' && lastOne) {
                            select = lastOne;
                        }
                    } else {
                        select = findPrev;
                    }
                } else {
                    if (!findNext) {
                        select = stageElements[0];
                    } else {
                        select = findNext;
                    }
                }
                if (select.id != current.id) {
                    StageSelectElements["@{set}"](select);
                }
            }
        }
    },
    '@{find.under.position}'(info, { pageY }) {
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
            let index = info.index;
            if ((rect.top + rect.height / 2) < pageY) {
                rect.top += rect.height;
                index++;
            }
            return {
                ctrl: info.ctrl,
                elements: info.ownerList,
                index,
                rect
            }
        } else if (info.role == 'column') {
            let index = info.index;
            let nearTop = rect.top + 5 >= pageY;
            let nearBottom = rect.top + rect.height - 5 <= pageY;
            if (nearBottom) {
                index++;
                rect.top += rect.height;
            }
            if (nearTop || nearBottom) {
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
            let col = entity.props.columns[subIndex];
            let elements = col.elements,
                count = elements.length;
            if (count) {
                index = count;
                let e = elements[count - 1];
                if (moved && moved.id == e.id) {
                    return;
                }
                bound = document.querySelector(`[eid=${e.id}]`).getBoundingClientRect();
                rect = {
                    left: bound.left,
                    top: bound.top + bound.height,
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
            let index = info.index;
            if ((rect.top + rect.height / 2) < pageY) {
                rect.top += rect.height;
                index++;
            }
            return {
                ctrl: info.ctrl,
                elements: info.ownerList,
                index,
                rect
            }
        }
    },
    '@{find.element.env.by.id}'(id) {
        let list = null, entity = null, index = -1;
        let walk = (elements) => {
            let i = 0, find = false;
            for (let e of elements) {
                if (e.id == id) {
                    index = i;
                    list = elements;
                    entity = e;
                    find = true;
                    break;
                } else if (e.role == 'layout') {
                    for (let c of e.props.columns) {
                        walk(c.elements);
                        if (find) break;
                    }
                }
                i++;
            }
        };
        let layouts = State.get('@{stage.layouts}');
        walk(layouts);
        return {
            ownerList: list,
            entity,
            index
        };
    },
    '@{find.best.place.info}'(hover, moved) {
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
                    lastNode = document.querySelector(`[eid=${last.id}]`);
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
                    let i = this['@{find.element.env.by.id}'](entityId);
                    if (moved && moved.id == i.entity.id) {
                        return;
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
                        entity: i.entity,
                        index: i.index,
                        ownerList: i.ownerList,
                        node: hover,
                    };
                }
            }
        }
        return null;
    }
};