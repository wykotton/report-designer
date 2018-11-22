/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Designer from '../designer';
import Props from '../../designer/props';
export default Designer.extend({
    ctor() {
        this.set({
            view: '@./index'
        });
    }
});

let LayoutFactory = (type, title, cols) => {
    return {
        type,
        role: 'layout',
        title: title,
        icon: '&#xe60a;',
        getProps() {
            let columns = [];
            for (let w of cols) {
                columns.push({
                    width: w,
                    elements: []
                });
            }
            return {
                columns,
                margin: '5px 5px 5px 5px',
                padding: '5px 5px 5px 5px',
                locked: false
            }
        },
        props: [{
            tip: '@{lang#props.col.rate}',
            key: 'columns',
            dockTop: true,
            type: Props["@{column}"],
            ifShow(p) {
                return p.columns.length > 1;
            }
        }, {
            tip: '@{lang#props.margin}',
            key: 'margin',
            dockTop: true,
            type: Props["@{guage}"]
        }, {
            tip: '@{lang#props.padding}',
            key: 'padding',
            dockTop: true,
            type: Props["@{guage}"]
        }, {
            type: Props["@{spliter}"]
        }, {
            tip: '@{lang#props.locked}',
            key: 'locked',
            type: Props["@{boolean}"],
            refresh: true,
            free: true
        }]
    };
};
export let Layout1 = LayoutFactory('layout1', '一列', [1]);
export let Layout2 = LayoutFactory('layout2', '二列', [.5, .5]);
export let Layout3 = LayoutFactory('layout3', '三列', [.33, .33, .34]);
export let Layout4 = LayoutFactory('layout4', '四列', [.25, .25, .25, .25]);