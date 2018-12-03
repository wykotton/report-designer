import { toMap, State } from 'magix';
export default {
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
                    '@{stage.select.elements.map}': toMap(selectElements, 'id')
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
                '@{stage.select.elements.map}': toMap(selectElements, 'id')
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
                '@{stage.select.elements.map}': toMap(selectElements, 'id')
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
            '@{stage.select.elements.map}': toMap(selectElements, 'id')
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
