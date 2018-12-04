import { State, node } from 'magix';
export default {
    '@{real.to.stage.coord}'({ x, y }) {
        let n = node('stage_canvas');
        let pos = n.getBoundingClientRect();
        x = x - pos.left;// + oNode.prop('scrollLeft');
        y = y - pos.top;// + oNode.prop('scrollTop');
        return {
            x,
            y
        };
    },
    '@{stage.to.real.coord}'({ x, y }) {
        let n = node('stage_canvas');
        let pos = n.getBoundingClientRect();
        x = x + pos.left;// + oNode.prop('scrollLeft');
        y = y + pos.top;// + oNode.prop('scrollTop');
        return {
            x,
            y
        };
    },
    '@{to.show.value}'(x) {
        let s = State.get('@{stage.scale}');
        return (x / s) | 0;
    },
    '@{to.real.value}'(x) {
        let s = State.get('@{stage.scale}');
        return x * s;
    }
};