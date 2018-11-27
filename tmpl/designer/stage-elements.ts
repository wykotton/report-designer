import Magix, { has, State, toMap } from 'magix';
import Follower from '../gallery/mx-pointer/follower';
import DHistory from './history';
import StageSelectElements from './stage-select';
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
            event.preventDefault();
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
                State.fire('@{event#toolbox.drag.element.drop}');
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
                        if (e.role == 'layout' && !e.props.locked) {
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
                    DHistory["@{save}"]();
                }
            }
        }
    }
};