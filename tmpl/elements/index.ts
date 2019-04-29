import { toMap as ToMap } from 'magix';
import Line from './line/designer';
import Bezier from './bezier/designer';
import Rect from './rect/designer';
import Circle from './circle/designer';
import XText from './text/designer';
import XImage from './image/designer';
import Repeat from './repeat/designer';
import Page from './page/designer';
import ChartLine from './chart-line/designer';
import ChartMeter from './chart-meter/designer';
import ChartBar from './chart-bar/designer';
import ChartPie from './chart-pie/designer';
let Elements = [
    Line,
    Bezier,
    Rect,
    Circle,
    XText,
    XImage,
    Repeat,
    ChartLine,
    ChartMeter,
    ChartBar,
    ChartPie
];
let ElementsMap = ToMap(Elements, 'type');
let Groups = [Line, Bezier, Rect, Circle, XText, XImage, Repeat, { spliter: true }, {
    icon: '&#xe629;',
    title: '图表',
    subs: [ChartLine, ChartMeter, ChartBar, ChartPie]
}];
export default {
    '@{element.list}'() {
        return Groups;
    },
    '@{get.page}'() {
        return Page;
    },
    '@{by.json}'(elements) {
        let map = {};
        let walk = es => {
            for (let e of es) {
                let ctrl = ElementsMap[e.type];
                e.ctrl = ctrl;
                map[e.id] = e;
                if (e.role == 'layout') {
                    for (let c of e.props.columns) {
                        walk(c.elements);
                    }
                }
            }
        };
        walk(elements);
        return {
            elements,
            map
        };
    }
};