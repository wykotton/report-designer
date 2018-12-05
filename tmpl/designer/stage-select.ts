import { State, toMap } from 'magix';
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
    }
}