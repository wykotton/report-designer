import { State } from 'magix';
import Consts from './const';
let UndoList = [];
let RedoList = [];

let BuferStage = null;
let BuferTimer = -1;
let LastType = '';
//历史记录只能还原到的编辑区状态
let DefaultStage = null;
let GetSnapshot = () => {
    return JSON.stringify({
        page: State.get('@{stage.page}'),
        scale: State.get('@{stage.scale}'),
        elements: State.get('@{stage.elements}'),
        select: State.get('@{stage.select.elements}'),
        xLines: State.get('@{stage.x.help.lines}'),
        yLines: State.get('@{stage.y.help.lines}')
    });
};
let UpdateStage = jsonStr => {
    let json = JSON.parse(jsonStr);
    let c = State.get('@{stage.scale}');
    let s = json.scale || c;
    State.fire('@{event#stage.apply.state}', {
        json
    });
    State.fire('@{event#history.shift}', {
        scale: c !== s
    });
};
export default {
    '@{save.default}'() {
        if (!DefaultStage) {
            DefaultStage = GetSnapshot();
        }
    },
    '@{query.status}'() {
        return {
            canRedo: RedoList.length,
            canUndo: UndoList.length
        };
    },
    '@{clear}'() {
        UndoList.length = 0;
        RedoList.length = 0;
    },
    '@{undo}'() {
        let c = UndoList.length;
        //当有历史记录时我们才进行还原操作
        if (c > 0) {
            let last = UndoList.pop();
            RedoList.push(last);
            let current = UndoList[UndoList.length - 1] || DefaultStage;
            UpdateStage(current);
        }
    },
    '@{redo}'() {
        let current = RedoList.pop();
        if (current) {
            UndoList.push(current);
            UpdateStage(current);
        }
    },
    '@{save}'(type = '_save', waiting = 0) {
        let stage = GetSnapshot();
        if (type != LastType) {
            if (BuferStage) {
                UndoList.push(BuferStage);
                BuferStage = null;
                LastType = type;
            }
        }
        RedoList.length = 0;
        let pushUndo = status => {
            UndoList.push(status);
            if (UndoList.length > Consts["@{history.max.count}"]) {
                DefaultStage = UndoList.shift();
            }
            State.fire('@{event#history.status.change}');
        };
        if (waiting) {
            BuferStage = stage;
            clearTimeout(BuferTimer);
            BuferTimer = setTimeout(() => {
                pushUndo(BuferStage);
                BuferStage = null;
            }, waiting);
        } else {
            pushUndo(stage);
        }
    }
};