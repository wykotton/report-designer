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
        type: 'repeat',
        role: 'repeat',
        title: '@{lang#elements.repeat}',
        icon: '&#xe78f;',
        getProps(x, y) {
            return {
                height: 100,
                alpha: 1,
                x,
                y,
                rotate: 0,
                width: 200,
                radius: 0,
                image: '',
                repeat: 'repeat',
                imageWidth: 0,
                imageHeight: 0,
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
            tip: '@{lang#props.border.radius}',
            key: 'radius',
            type: Props["@{number}"],
            min: 0
        }, {
            tip: '@{lang#props.image}',
            key: 'image',
            type: Props["@{image}"],
            refresh: true,
            write(v, props, e) {
                props.imageWidth = e.width;
                props.imageHeight = e.height;
                return v;
            }
        }, {
            tip: '@{lang#props.image.width}',
            key: 'imageWidth',
            type: Props["@{number}"],
            min: 0,
            ifShow(props) {
                return props.image;
            }
        }, {
            tip: '@{lang#props.image.height}',
            key: 'imageHeight',
            type: Props["@{number}"],
            min: 0,
            ifShow(props) {
                return props.image;
            }
        }, {
            tip: '@{lang#props.background.repeat}',
            key: 'repeat',
            type: Props["@{dropdown}"],
            ifShow(props) {
                return props.image;
            },
            items: [{
                text: I18n('@{lang#props.repeat}'),
                value: 'repeat'
            }, {
                text: I18n('@{lang#props.repeat.x}'),
                value: 'repeat-x'
            }, {
                text: I18n('@{lang#props.repeat.y}'),
                value: 'repeat-y'
            }]
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