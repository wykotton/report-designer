/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Props from '../../designer/props';
import I18n from '../../i18n/index';
import Converter from '../../util/converter';
import Designer from '../designer';
export default Designer.extend({
    ctor() {
        this.set({
            view: '@./index'
        });
    }
}, {
        type: 'line',
        role: 'line',
        title: '@{lang#elements.line}',
        icon: '&#xe601;',
        modifier: {
            width: 1,
            height: 1,
            rotate: 1
        },
        scales: ['x', 'y', 'width', 'height'],
        moved: [{
            key: 'x',
            use: 'x'
        }, {
            key: 'y',
            use: 'y'
        }],
        json: {
            x: Converter["@{to.show.value}"],
            y: Converter["@{to.show.value}"],
            width: Converter["@{to.show.value}"],
            height: Converter["@{to.show.value}"],
            alpha: 1,
            title: 1,
            rotate: 1,
            linetype: 1,
            color:1
        },
        getProps(x, y) {
            return {
                height: 1,
                alpha: 1,
                x,
                y,
                rotate: 0,
                width: 200,
                linetype: 'solid',
                color: '#000000',
                locked: false
            }
        },
        props: [{
            tip: '@{lang#props.x}',
            type: Props["@{number}"],
            key: 'x',
            read: Converter["@{to.show.value}"],
            write: Converter["@{to.real.value}"]
        }, {
            tip: '@{lang#props.y}',
            type: Props["@{number}"],
            key: 'y',
            read: Converter["@{to.show.value}"],
            write: Converter["@{to.real.value}"]
        }, {
            tip: '@{lang#props.long}',
            type: Props["@{number}"],
            key: 'width',
            min: 0,
            read: Converter["@{to.show.value}"],
            write: Converter["@{to.real.value}"]
        }, {
            tip: '@{lang#props.rotate}',
            type: Props["@{number}"],
            key: 'rotate',
            min: -360,
            max: 360
        }, {
            type: Props["@{spliter}"]
        }, {
            tip: '@{lang#props.alpha}',
            key: 'alpha',
            type: Props["@{number}"],
            step: 0.1,
            fixed: 1,
            min: 0,
            max: 1
        }, {
            tip: '@{lang#props.height}',
            key: 'height',
            type: Props["@{number}"],
            min: 0,
            max: 100,
            read: Converter["@{to.show.value}"],
            write: Converter["@{to.real.value}"]
        }, {
            tip: '@{lang#props.line.type}',
            key: 'linetype',
            type: Props["@{dropdown}"],
            items: [{
                text: I18n('@{lang#props.border.type.solid}'),
                value: 'solid'
            }, {
                text: I18n('@{lang#props.border.type.dotted}'),
                value: 'dotted'
            }, {
                text: I18n('@{lang#props.border.type.dashed}'),
                value: 'dashed'
            }]
        }, {
            tip: '@{lang#props.color}',
            key: 'color',
            type: Props["@{color}"]
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