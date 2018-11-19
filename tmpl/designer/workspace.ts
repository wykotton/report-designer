import Magix, { State, toMap as ToMap, Vframe } from 'magix';
import DHistory from './history';
import Cursor from '../gallery/mx-pointer/cursor';
import Transform from '../util/transform';

let IsLineCross = (line1, line2) => {
    let s1 = line1.start,
        e1 = line1.end,
        s2 = line2.start,
        e2 = line2.end;
    let d1 = ((e1.x - s1.x) * (s2.y - s1.y) - (e1.y - s1.y) * (s2.x - s1.x)) * ((e1.x - s1.x) * (e2.y - s1.y) - (e1.y - s1.y) * (e2.x - s1.x));
    let d2 = ((e2.x - s2.x) * (s1.y - s2.y) - (e2.y - s2.y) * (s1.x - s2.x)) * ((e2.x - s2.x) * (e1.y - s2.y) - (e2.y - s2.y) * (e1.x - s2.x));
    return d1 < 0 && d2 < 0;
};
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
    '@{add.element}'(e: MouseEvent, focus: boolean) {
        let element = State.get('@{memory.cache.element}');
        if (element) {
            let columns = State.get('@{stage.columns}');
            let elements = columns[0].elements;
            let props = element.getProps(e.pageX, e.pageY);
            let scale = State.get('@{stage.scale}');
            props.width *= scale;
            props.height *= scale;
            let em = {
                id: Magix.guid('e_'),
                ctor: element,
                type: element.type,
                props
            };
            elements.push(em);
            if (focus) {
                StageSelectElements["@{set}"](em);
            }
            return elements;
        }
    },
    '@{multi.select}'(e, element) {
        if (e.shiftKey || e.ctrlKey || e.metaKey) {
            if (!element.props.locked) {
                let elements = State.get('@{stage.select.elements}');
                let exists = false;
                for (let i = elements.length; i--;) {
                    let m = elements[i];
                    if (m.id == element.id) {
                        exists = true;
                    }
                    if (m.props.locked) {
                        elements.splice(i, 1);
                    }
                }
                if (exists && elements.length > 1) {
                    if (StageSelectElements["@{remove}"](element)) {
                        DHistory["@{save}"]();
                    }
                    return;
                }
                if (StageSelectElements['@{add}'](element)) {
                    DHistory["@{save}"]();
                }
            }
        } else {
            if (StageSelectElements['@{set}'](element)) {
                DHistory["@{save}"]();
            }
        }
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
        if (event.shiftKey || event.ctrlKey || event.metaKey) {//多选
            StageElements["@{multi.select}"](event, element);
        } else {
            Cursor["@{show.by.type}"]('move');
            let startInfos = [],
                exist = false;
            for (let e of elements) {
                if (element.id == e.id) {
                    exist = true;
                }
                startInfos.push({
                    x: e.props.x,
                    y: e.props.y
                });
            }
            if (!exist) {
                if (StageSelectElements['@{set}'](element)) {
                    DHistory["@{save}"]();
                }
                startInfos.length = 0;
                startInfos.push({
                    x: element.props.x,
                    y: element.props.y
                });
                elements.length = 0;
                elements.push(element);
            }
            let elementMoved = false;
            State.fire('@{event#stage.lock.scroll}', {
                show: 1
            });
            view['@{drag.drop}'](event, evt => {
                let offsetX = evt.pageX - event.pageX;
                let offsetY = evt.pageY - event.pageY;
                let index = 0;
                for (let e of elements) {
                    let s = startInfos[index++];
                    if (!e.props.locked) {
                        elementMoved = true;
                        e.props.x = s.x + offsetX;
                        e.props.y = s.y + offsetY;
                        let vf = Vframe.get(e.id);
                        if (vf) {
                            if (vf.invoke('assign', [{ element: e }])) {
                                vf.invoke('render');
                            }
                        }
                    }
                }
                State.fire('@{event#stage.select.element.props.change}');
            }, () => {
                if (elementMoved) {
                    DHistory["@{save}"]();
                }
                Cursor["@{hide}"]();
                State.fire('@{event#stage.lock.scroll}');
            });
        }
    },
    '@{delete.select.elements}'() {
        let selectElements = State.get('@{stage.select.elements}');
        let stageElements = State.get('@{stage.elements}');
        let update = false;
        if (selectElements.length) {
            let map = ToMap(selectElements, 'id');
            for (let i = stageElements.length; i--;) {
                if (map[stageElements[i].id]) {
                    update = true;
                    stageElements.splice(i, 1);
                }
            }
            if (update) {
                StageSelectElements["@{set}"]();
            }
        }
        return update;
    },
    '@{get.elements.location}'() {
        let columns = State.get('@{stage.columns}');
        let elements = columns[0].elements;
        let locations = [],
            props, rotate;
        for (let e of elements) {
            props = e.props;
            if (props.locked) continue;
            rotate = props.rotate || 0;
            let rect = {
                x: props.x,
                y: props.y,
                width: props.width,
                height: props.height
            };
            let tsed = Transform["@{rotate.rect}"](rect, rotate);
            let lt = tsed.point[0];
            let rt = tsed.point[2];
            let lb = tsed.point[6];
            let rb = tsed.point[4];
            let tl = lt, tt = lt, tr = lt, tb = lt;
            for (let p of [rt, lb, rb]) {
                if (p.x < tl.x) {
                    tl = p;
                }
                if (p.x > tr.x) {
                    tr = p;
                }
                if (p.y < tt.y) {
                    tt = p;
                }
                if (p.y > tb.y) {
                    tb = p;
                }
            }
            locations.push({
                element: e,
                left: tl,
                top: tt,
                right: tr,
                bottom: tb,
                points: [lt, rt, lb, rb],
                lines: [{
                    start: lt,
                    end: rt
                }, {
                    start: rt,
                    end: rb
                }, {
                    start: rb,
                    end: lb
                }, {
                    start: lb,
                    end: lt
                }]
            });
        }
        return locations;
    },
    '@{get.intersect.elements}'(elementLocations, rect, bak) {
        let selected = [], find,
            rectLines = [{
                start: {
                    x: rect.x,
                    y: rect.y
                },
                end: {
                    x: rect.x + rect.width,
                    y: rect.y
                }
            }, {
                start: {
                    x: rect.x + rect.width,
                    y: rect.y
                },
                end: {
                    x: rect.x + rect.width,
                    y: rect.y + rect.height
                }
            }, {
                start: {
                    x: rect.x + rect.width,
                    y: rect.y + rect.height
                },
                end: {
                    x: rect.x,
                    y: rect.y + rect.height
                }
            }, {
                start: {
                    x: rect.x,
                    y: rect.y + rect.height
                },
                end: {
                    x: rect.x,
                    y: rect.y
                }
            }];
        for (let e of elementLocations) {
            find = false;
            if (!bak || !bak[e.element.id]) {
                for (let p of e.points) {
                    if (p.x >= rect.x &&
                        p.y >= rect.y &&
                        p.x <= (rect.x + rect.width) &&
                        p.y <= (rect.y + rect.height)) {
                        selected.push(e.element);
                        find = true;
                        break;
                    }
                }
                if (!find) {
                    /*mc-uncheck*/
                    for (let l of e.lines) {
                        /*mc-uncheck*/
                        for (let rl of rectLines) {
                            if (IsLineCross(l, rl)) {
                                find = true;
                                selected.push(e.element);
                                break;
                            }
                        }
                        if (find) {
                            break;
                        }
                    }
                }
            } else if (bak) {
                selected.push(e.element);
            }
        }
        return selected;
    },
    '@{delete.element.by.id}'(id, silent) {
        let stageElements = State.get('@{stage.elements}');
        for (let i = stageElements.length; i--;) {
            let e = stageElements[i];
            if (id == e.id) {
                stageElements.splice(i, 1);
            }
        }
        if (!silent) {
            StageSelectElements["@{set.all}"]();
        }
    },
    '@{select.all}'() {
        let last = State.get('@{stage.select.elements.map}');
        let elements = State.get('@{stage.elements}');
        let added = [];
        for (let m of elements) {
            if (!m.props.locked) {
                added.push(m);
            }
        }
        StageSelectElements["@{set.all}"](added);
        if (StageSelectElements["@{has.changed}"](last)) {
            DHistory["@{save}"]();
        }
    },
    '@{move.element}'(to, element) {
        //3 top 4 bottom 5 to up 6 to down
        let elements = State.get('@{stage.elements}'),
            index = -1;
        for (let i = elements.length; i--;) {
            let e = elements[i];
            if (e.id === element.id) {
                elements.splice(index = i, 1);
                break;
            }
        }
        if (to == 3) {
            elements.push(element);
        } else if (to == 4) {
            elements.unshift(element);
        } else if (to == 5) {
            elements.splice(index + 1, 0, element);
        } else if (to == 6) {
            if (index === 0) index = 1;
            elements.splice(index - 1, 0, element);
        }
        return true;
    },
    '@{handle.key.tab}'(e) {
        let selectElements = State.get('@{stage.select.elements}');
        let stageElements = State.get('@{stage.elements}');
        //多选2个以上的我们取消多选，然后从头选择一个
        let c = selectElements.length;
        let current = selectElements[0];
        if (c === 0 || c > 1) {
            current = stageElements[e.shiftKey ? 0 : stageElements.length - 1];
            StageSelectElements["@{set}"](current);
        } else {
            let prev, next;
            for (let i = stageElements.length; i--;) {
                let m = stageElements[i];
                if (m.id == current.id) {
                    prev = stageElements[i - 1];
                    break;
                }
                next = m;
            }
            let select = null;
            if (e.shiftKey) {
                if (!prev) {
                    prev = stageElements[stageElements.length - 1];
                }
                select = prev;
            } else {
                if (!next) {
                    next = stageElements[0];
                }
                select = next;
            }
            if (select.id != current.id) {
                StageSelectElements["@{set}"](select);
            }
        }
    }
};
let Clone = a => {
    if (Array.isArray(a)) {
        let c = [];
        for (let b of a) {
            c.push(Clone(b));
        }
        a = c;
    } else if (Object.prototype.toString.call(a) == '[object Object]') {
        let c = {};
        for (let b in a) {
            c[b] = Clone(a[b]);
        }
        a = c;
    }
    return a;
};
export let Clipboard = {
    '@{has.elements}'() {
        let list = this['@{copy.list}'] || [];
        return list.length;
    },
    '@{get.copy.list}'() {
        let list = this['@{copy.list}'] || [];
        return list;
    },
    '@{copy.elements}'() {
        let me = this;
        let list = [];
        let elements = State.get('@{stage.select.elements}');
        for (let m of elements) {
            list.push(m);
        }
        me['@{copy.list}'] = list;
    },
    '@{cut.elements}'() {
        //编辑锁定的不能剪切
        let elements = State.get('@{stage.select.elements}');
        if (elements.length == 1 && elements[0].props.locked) {
            return;
        }
        this['@{copy.elements}']();
        this['@{is.cut}'] = true;
    },
    '@{paste.elements}'(xy?: { x: number, y: number }) {
        let me = this;
        let list = me['@{copy.list}'];
        let elements = State.get('@{stage.elements}');
        let update = false;
        if (list) {
            update = true;
            let selected = [];
            let index = 0, diffX = 0, diffY = 0;
            let hasSameXY = props => {
                for (let c of elements) {
                    if (c.props.x == props.x && c.props.y == props.y) {
                        return 1;
                    }
                }
                return 0;
            };
            let setXY = props => {
                if (index === 0) {
                    if (xy) {
                        diffX = props.x - xy.x;
                        diffY = props.y - xy.y;
                        props.x = xy.x;
                        props.y = xy.y;
                    } else {
                        let oldX = props.x;
                        let oldY = props.y;
                        while (hasSameXY(props)) {
                            props.x += 20;
                            props.y += 20;
                        }
                        if ((props.x + props.width) < 0) {
                            props.x = -props.width / 2;
                        }
                        if ((props.y + props.height) < 0) {
                            props.y = -props.height / 2
                        }
                        while (hasSameXY(props)) {
                            props.x -= 4;
                            props.y -= 4;
                        }
                        diffX = oldX - props.x;
                        diffY = oldY - props.y;
                    }
                } else {
                    props.x -= diffX;
                    props.y -= diffY;
                }
            };
            for (let m of list) {
                let nm = Clone(m);
                let props = nm.props;
                setXY(props);
                props.locked = false;
                index++;
                nm.id = Magix.guid('e_');
                elements.push(nm);
                selected.push(nm);
                if (me['@{is.cut}']) {
                    StageElements["@{delete.element.by.id}"](m.id, true);
                }
            }

            if (me['@{is.cut}']) {
                delete me['@{is.cut}'];
                delete me['@{copy.list}'];
            }
            State.fire('@{event#stage.elements.change}');
            StageSelectElements['@{set.all}'](selected);
        }
        return update;
    }
}