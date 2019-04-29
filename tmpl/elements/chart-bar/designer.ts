/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Props from '../../designer/props';
import Converter from '../../util/converter';
import Designer from '../designer';
export default Designer.extend({
    ctor() {
        this.set({
            view: '@./index'
        });
    }
}, {
        type: 'chart-bar',
        role: 'chart-bar',
        title: '@{lang#elements.chart-bar}',
        icon: '&#xe603;',
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
            background: 1
        },
        getProps(x, y) {
            return {
                background: '',
                alpha: 1,
                width: 500,
                height: 300,
                x,
                y,
                title: '',
                rotate: 0,
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
            tip: '@{lang#props.background}',
            type: Props["@{color}"],
            key: 'background',
            alpha: true,
            clear: true
        }, {
            tip: '@{lang#props.chart.title}',
            key: 'title',
            type: Props["@{text.input}"]
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