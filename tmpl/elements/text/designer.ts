/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Designer from '../designer';
import Props from '../../designer/props';
import Converter from '../../util/converter';
export default Designer.extend({
    ctor() {
        this.set({
            view: '@./index'
        });
    }
}, {
        type: 'text',
        role: 'text',
        title: '@{lang#elements.text}',
        icon: '&#xe6bc;',
        getProps(x, y) {
            return {
                background: '',
                height: 25,
                alpha: 1,
                text: '',
                ls: 0,
                x,
                y,
                rotate: 0,
                width: 200,
                forecolor: '#000000',
                fontsize: 14,
                locked: false,
                style: {
                    bold: false,
                    underline: false,
                    italic: false
                },
                align: {
                    h: 'flex-start',
                    v: 'flex-start'
                }
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
            tip: '@{lang#props.font.size}',
            key: 'fontsize',
            type: Props["@{number}"],
            min: 0
        }, {
            tip: '@{lang#props.alpha}',
            key: 'alpha',
            type: Props["@{number}"],
            step: 0.1,
            fixed: 1,
            min: 0,
            max: 1
        }, {
            tip: '@{lang#props.letter.spacing}',
            key: 'ls',
            type: Props["@{number}"],
            min: 0
        }, {
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
            tip: '@{lang#props.font.style}',
            key: 'style',
            type: Props["@{font.style}"]
        }, {
            tip: '@{lang#props.font.align}',
            key: 'align',
            type: Props["@{font.align}"]
        }, {
            tip: '@{lang#props.text.content}',
            key: 'text',
            type: Props["@{text.area}"],
            dockTop: true
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