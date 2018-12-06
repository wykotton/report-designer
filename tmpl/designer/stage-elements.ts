import Magix, { has, State, toMap, node } from 'magix';
import Follower from '../gallery/mx-pointer/follower';
import DHistory from './history';
import StageSelectElements from './stage-select';
let RectIntersect = (rect1, rect2) => {
    let half1Width = rect1.width / 2,
        half1Height = rect1.height / 2,
        half2Width = rect2.width / 2,
        half2Height = rect2.height / 2,
        cen1 = {
            x: rect1.x + half1Width,
            y: rect1.y + half1Height
        },
        cen2 = {
            x: rect2.x + half2Width,
            y: rect2.y + half2Height
        };

    return Math.abs(cen2.x - cen1.x) <= half1Width + half2Width &&
        Math.abs(cen2.y - cen1.y) <= half1Height + half2Height;
};
let ScrollIntoView = id => {
    let scroller = node('stage_outer').parentNode as HTMLDivElement;
    let n = node(id) as HTMLDivElement;
    let rect = scroller.getBoundingClientRect();
    let rect1 = {
        x: rect.left,
        y: rect.top,
        width: rect.width - 20,
        height: rect.height - 20
    };
    rect = n.getBoundingClientRect();
    let rect2 = {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
    };
    if (!RectIntersect(rect1, rect2)) {
        let offset = scroller.clientHeight / 3;
        scroller.classList.add('@index.less:stage-smooth');
        scroller.scrollTop = rect2.y + scroller.scrollTop - rect1.y - offset;
    }
};
export default {
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
    '@{add.element.to.top}'(ctrl) {
        let props = ctrl.getProps();
        let em = {
            id: Magix.guid('e_'),
            type: ctrl.type,
            role: ctrl.role,
            ctrl,
            props
        };
        let layouts = State.get('@{stage.layouts}');
        layouts.unshift(em);
        StageSelectElements["@{set}"](em);
        return em;
    },
    '@{move.element}'(e, moved) {
        let ownerList = null;
        let walk = (elements) => {
            let i = 0, find = false;
            for (let e of elements) {
                if (e.id == moved.id) {
                    elements.splice(i, 1, null);
                    ownerList = elements;
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
        e.elements.splice(e.index, 0, moved);
        for (let i = ownerList.length; i--;) {
            if (ownerList[i] === null) {
                ownerList.splice(i, 1);
                break;
            }
        }
    },
    '@{elements.tree.map}'() {
        let layouts = State.get('@{stage.layouts}');
        let idMap = {}, elements = {};
        let mapped = (es, pId, type) => {
            let i = 0;
            for (let e of es) {
                idMap[e.id] = {
                    pId,
                    index: i,
                    elements: es,
                    type
                };
                elements[e.id] = e;
                if (e.role == 'layout') {
                    for (let c of e.props.columns) {
                        mapped(c.elements, e.id, e.role);
                    }
                }
                i++;
            }
        };
        mapped(layouts, 0, 'stage');
        return {
            idMap,
            elements
        };
    },
    '@{find.best.element.by.id}'(tree, elementId) {
        let { idMap, elements } = tree;
        let startId = elementId,
            locked = elementId;
        do {
            if (elements[startId].props.locked) {
                locked = startId;
            }
            startId = idMap[startId].pId;
        }
        while (has(idMap, startId));
        let pInfo = idMap[locked];
        return {
            entity: elements[locked],
            pInfo
        };
    },
    '@{select.or.move.elements}'(event, view) {
        let { element } = event.params;
        let tree = this['@{elements.tree.map}']();
        let { entity } = this['@{find.best.element.by.id}'](tree, element.id);
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
                if (StageSelectElements['@{set}'](entity)) {
                    DHistory["@{save}"]();
                }
            }
            return;
        }
        let exist = false;
        for (let e of elements) {
            if (entity.id == e.id) {
                exist = true;
            }
        }
        if (!exist) {
            if (StageSelectElements['@{set}'](entity)) {
                DHistory["@{save}"]();
            }
            elements.length = 0;
            elements.push(entity);
        }
        if (entity.props.locked) return;
        let ctrl = entity.ctrl;
        Follower["@{update}"](ctrl.icon);
        view['@{drag.drop}'](event, evt => {
            Follower["@{show}"](evt);
            State.fire('@{event#toolbox.drag.hover.change}', {
                pageX: evt.pageX,
                pageY: evt.pageY,
                clientX: evt.clientX,
                clientY: evt.clientY,
                moved: entity
            });
        }, (ex) => {
            Follower["@{hide}"]();
            if (ex) {
                let scroller = node('stage_outer').parentNode as HTMLDivElement;
                let sTop = scroller.scrollTop;
                ex.preventDefault();
                State.fire('@{event#toolbox.drag.element.drop}');
                if (sTop != scroller.scrollTop) {
                    scroller.scrollTop = sTop;
                }
            }
        });
    },
    '@{delete.select.elements}'() {
        let selectElements = State.get('@{stage.select.elements}');
        let layouts = State.get('@{stage.layouts}');
        let update = false;
        if (selectElements.length) {
            let map = toMap(selectElements, 'id');
            let walk = elements => {
                for (let i = elements.length, e; i--;) {
                    e = elements[i];
                    if (!e.props.locked) {
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
            let select = null;
            if (c === 0 || c > 1) {
                select = stageElements[e.shiftKey ? stageElements.length - 1 : 0];
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
                        if (e.role == 'layout' && !e.props.locked) {
                            for (let c of e.props.columns) {
                                find(c.elements);
                            }
                        }
                    }
                };
                find(stageElements);
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
            }
            if (!current || select.id != current.id) {
                StageSelectElements["@{set}"](select);
                DHistory["@{save}"]();
                ScrollIntoView(select.id);
            }
        }
    },
    '@{scroll.into.view}': ScrollIntoView
};