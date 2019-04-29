import Magix, { State, Vframe, toMap, node } from 'magix';
import StageSelectElements from './stage-select';
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
export default {
    '@{add.element}'(e: MouseEvent, focus: boolean) {
        let ctrl = State.get('@{memory.cache.element.ctrl}');
        if (ctrl) {
            let elements = State.get('@{stage.elements}');
            let props = ctrl.getProps(e.pageX, e.pageY);
            let scale = State.get('@{stage.scale}');
            let scaledProps = {} as { x: number, y: number };
            for (let s of ctrl.scales) {
                scaledProps[s] = props[s] * scale;
            }
            let diffX = scaledProps.x - props.x;
            let diffY = scaledProps.y - props.y;
            for (let m of ctrl.moved) {
                if (m.use == 'x') {
                    scaledProps[m.key] -= diffX;
                } else {
                    scaledProps[m.key] -= diffY;
                }
            }
            for (let p in scaledProps) {
                props[p] = scaledProps[p];
            }
            let em = {
                id: Magix.guid('e_'),
                ctrl,
                type: ctrl.type,
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
            this["@{multi.select}"](event, element);
        } else {
            Cursor["@{show.by.type}"]('move');
            let startInfos = [],
                exist = false;
            for (let { id, ctrl, props } of elements) {
                if (element.id == id) {
                    exist = true;
                }
                let i = {};
                for (let m of ctrl.moved) {
                    i[m.key] = props[m.key];
                }
                startInfos.push(i);
            }
            if (!exist) {
                if (StageSelectElements['@{set}'](element)) {
                    DHistory["@{save}"]();
                }
                startInfos.length = 0;
                let i = {};
                for (let m of element.ctrl.moved) {
                    i[m.key] = element.props[m.key];
                }
                startInfos.push(i);
                elements.length = 0;
                elements.push(element);
            }
            let elementMoved = false;
            State.fire('@{event#stage.toggle.scroll}', {
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
                        let i = {};
                        for (let m of e.ctrl.moved) {
                            e.props[m.key] = s[m.key] + (m.use == 'x' ? offsetX : offsetY);
                        }
                        let vf = Vframe.byNode(node(e.id));
                        if (vf) {
                            if (vf.invoke('assign', [{
                                element: e,
                                onlyMove: true
                            }])) {
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
                State.fire('@{event#stage.toggle.scroll}');
            });
        }
    },
    '@{delete.select.elements}'() {
        let selectElements = State.get('@{stage.select.elements}');
        let stageElements = State.get('@{stage.elements}');
        let update = false;
        if (selectElements.length) {
            let map = toMap(selectElements, 'id');
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
        let elements = State.get('@{stage.elements}');
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