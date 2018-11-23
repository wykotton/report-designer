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
}, {
        type: 'layout',
        role: 'layout',
        title: '@{lang#elements.layout}',
        icon: '&#xe764;',
        getProps() {
            return {
                columns: [{
                    width: 1,
                    elements: []
                }],
                margin: '5px 5px 5px 5px',
                padding: '5px 5px 5px 5px',
                locked: false
            }
        },
        props: [{
            tip: '@{lang#props.col.rate}',
            key: 'columns',
            dockTop: true,
            type: Props["@{column}"]
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
    });