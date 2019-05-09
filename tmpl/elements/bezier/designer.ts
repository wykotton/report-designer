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
        type: 'bezier',
        role: 'bezier',
        title: '@{lang#elements.bezier}',
        icon: '&#xe71b;',
        scales: ['x', 'y', 'width', 'height', 'startX', 'startY', 'endX', 'endY', 'ctrl1X', 'ctrl1Y', 'ctrl2X', 'ctrl2Y'],
        moved: [{
            key: 'x',
            use: 'x'
        }, {
            key: 'y',
            use: 'y'
        }, {
            key: 'ctrl1X',
            use: 'x'
        }, {
            key: 'ctrl1Y',
            use: 'y'
        }, {
            key: 'ctrl2X',
            use: 'x'
        }, {
            key: 'ctrl2Y',
            use: 'y'
        }, {
            key: 'startX',
            use: 'x'
        }, {
            key: 'startY',
            use: 'y'
        }, {
            key: 'endX',
            use: 'x'
        }, {
            key: 'endY',
            use: 'y'
        }],
        json: {
            startX: Converter["@{to.show.value}"],
            startY: Converter["@{to.show.value}"],
            endX: Converter["@{to.show.value}"],
            endY: Converter["@{to.show.value}"],
            ctrl1X: Converter["@{to.show.value}"],
            ctrl1Y: Converter["@{to.show.value}"],
            ctrl2X: Converter["@{to.show.value}"],
            ctrl2Y: Converter["@{to.show.value}"],
            alpha: 1,
            linewidth: 1,
            color: 1
        },
        getProps(x, y) {
            return {
                alpha: 1,
                x,
                y,
                startX: x,
                startY: y,
                endX: x + 300,
                endY: y + 100,
                ctrl1X: x + 50,
                ctrl1Y: y + 50,
                ctrl2X: x + 250,
                ctrl2Y: y + 50,
                width: 300,
                height: 100,
                linewidth: 1,
                color: '#000000',
                locked: false
            }
        },
        props: [{
            tip: '@{lang#props.bezier.start.x}',
            key: 'startX',
            type: Props["@{number}"],
            read: Converter["@{to.show.value}"],
            write: Converter["@{to.real.value}"],
            bezier: 1
        }, {
            tip: '@{lang#props.bezier.start.y}',
            key: 'startY',
            type: Props["@{number}"],
            read: Converter["@{to.show.value}"],
            write: Converter["@{to.real.value}"],
            bezier: 1
        }, {
            tip: '@{lang#props.bezier.ctrl1.x}',
            key: 'ctrl1X',
            type: Props["@{number}"],
            read: Converter["@{to.show.value}"],
            write: Converter["@{to.real.value}"],
            bezier: 1
        }, {
            tip: '@{lang#props.bezier.ctrl1.y}',
            key: 'ctrl1Y',
            type: Props["@{number}"],
            read: Converter["@{to.show.value}"],
            write: Converter["@{to.real.value}"],
            bezier: 1
        }, {
            tip: '@{lang#props.bezier.ctrl2.x}',
            key: 'ctrl2X',
            type: Props["@{number}"],
            read: Converter["@{to.show.value}"],
            write: Converter["@{to.real.value}"],
            bezier: 1
        }, {
            tip: '@{lang#props.bezier.ctrl2.y}',
            key: 'ctrl2Y',
            type: Props["@{number}"],
            read: Converter["@{to.show.value}"],
            write: Converter["@{to.real.value}"],
            bezier: 1
        }, {
            tip: '@{lang#props.bezier.end.x}',
            key: 'endX',
            type: Props["@{number}"],
            read: Converter["@{to.show.value}"],
            write: Converter["@{to.real.value}"],
            bezier: 1
        }, {
            tip: '@{lang#props.bezier.end.y}',
            key: 'endY',
            type: Props["@{number}"],
            read: Converter["@{to.show.value}"],
            write: Converter["@{to.real.value}"],
            bezier: 1
        }, {
            type: Props["@{spliter}"]
        }, {
            tip: '@{lang#props.width}',
            key: 'linewidth',
            type: Props["@{number}"],
            min: 0,
            max: 20
        }, {
            tip: '@{lang#props.alpha}',
            key: 'alpha',
            type: Props["@{number}"],
            step: 0.1,
            fixed: 1,
            min: 0,
            max: 1
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