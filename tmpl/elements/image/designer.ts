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
        type: 'image',
        role: 'image',
        title: '@{lang#elements.image}',
        icon: '&#xe650;',
        getProps(x, y) {
            return {
                height: 100,
                alpha: 1,
                x,
                y,
                rotate: 0,
                width: 200,
                image: '',
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
            tip: '@{lang#props.image}',
            key: 'image',
            //dockTop: true,
            refresh: true,
            type: Props["@{image}"],
            write(v, props, e) {
                if (!v) {
                    e.width = 200;
                    e.height = 100;
                }
                props.width = e.width;
                props.height = e.height;
                return v;
            }
        }, {
            tip: '@{lang#props.image.reset}',
            type: Props["@{image.reset}"],
            key: 'image',
            ifShow(props) {
                return props.image;
            }
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