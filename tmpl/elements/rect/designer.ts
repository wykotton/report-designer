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
        type: 'rect',
        role: 'rect',
        title: '@{lang#elements.rect}',
        icon: '&#xe6c7;',
        getProps(x, y) {
            return {
                fillcolor: '',
                height: 100,
                alpha: 1,
                x,
                y,
                rotate: 0,
                width: 200,
                borderwidth: 1,
                bordertype: 'solid',
                bordercolor: '#000000',
                radius: 0,
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
            tip: '@{lang#props.width}',
            type: Props["@{number}"],
            key: 'width',
            min: 0,
            read: Converter["@{to.show.value}"],
            write: Converter["@{to.real.value}"]
        }, {
            tip: '@{lang#props.height}',
            key: 'height',
            type: Props["@{number}"],
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
            tip: '@{lang#props.border.width}',
            key: 'borderwidth',
            type: Props["@{number}"],
            min: 0
        }, {
            tip: '@{lang#props.border.type}',
            key: 'bordertype',
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
            tip: '@{lang#props.bordercolor}',
            key: 'bordercolor',
            type: Props["@{color}"]
        }, {
            tip: '@{lang#props.fillcolor}',
            key: 'fillcolor',
            clear: true,
            alpha: true,
            type: Props["@{color}"]
        }, {
            tip: '@{lang#props.border.radius}',
            key: 'radius',
            type: Props["@{number}"],
            min: 0
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