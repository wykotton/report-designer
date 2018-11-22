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
        type: 'hw',
        role: 'hw',
        title: '文本',
        icon: '&#xe6bc;',
        getProps(x, y) {
            return {
                background: '',
                forecolor: '#000000',
                fontsize: 14,
                locked: false
            }
        },
        props: [{
            tip: '@{lang#props.background}',
            key: 'background',
            clear: true,
            alpha: true,
            type: Props["@{color}"]
        }, {
            tip: '@{lang#props.forecolor}',
            key: 'forecolor',
            type: Props["@{color}"]
        }, {
            tip: '@{lang#props.font.size}',
            key: 'fontsize',
            type: Props["@{number}"],
            min: '0'
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