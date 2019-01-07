/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Props from '../../designer/props';
import I18n from '../../i18n/index';
import Const from '../../designer/const';
export default {
    title: '@{lang#elements.page}',
    getProps() {
        return {
            width: Const["@{page.width}"],
            height: Const["@{page.height}"],
            background: '#ffffff',
            backgroundImage: '',
            backgroundRepeat: 'full',
            backgroundWidth: 0,
            backgroundHeight: 0,
            scaleType: 'auto',
            hor: 0,
            ver: 0
        }
    },
    props: [{
        tip: '@{lang#props.width}',
        key: 'width',
        type: Props["@{number}"],
        min: 0
    }, {
        tip: '@{lang#props.height}',
        key: 'height',
        type: Props["@{number}"],
        min: 0
    }, {
        tip: '@{lang#props.page.scale}',
        key: 'scaleType',
        type: Props["@{dropdown}"],
        items: [{
            text: I18n('@{lang#props.scale.auto}'),
            value: 'auto'
        }, {
            text: I18n('@{lang#props.scale.full}'),
            value: 'full'
        }]
    }, {
        type: Props["@{spliter}"]
    }, {
        tip: '@{lang#props.background}',
        key: 'background',
        type: Props["@{color}"]
    }, {
        tip: '@{lang#props.background.image}',
        //dockTop: true,
        key: 'backgroundImage',
        type: Props["@{image}"],
        refresh: true,
        write(v, props, e) {
            props.backgroundWidth = e.width;
            props.backgroundHeight = e.height;
            return v;
        }
    }, {
        tip: '@{lang#props.background.repeat}',
        key: 'backgroundRepeat',
        type: Props["@{dropdown}"],
        items: [{
            text: I18n('@{lang#props.full}'),
            value: 'full'
        }, {
            text: I18n('@{lang#props.no.repeat}'),
            value: 'no-repeat'
        }, {
            text: I18n('@{lang#props.repeat.x}'),
            value: 'repeat-x'
        }, {
            text: I18n('@{lang#props.repeat.y}'),
            value: 'repeat-y'
        }, {
            text: I18n('@{lang#props.repeat}'),
            value: 'repeat'
        }],
        refresh: true,
        ifShow(page) {
            return page.backgroundImage;
        }
    }, {
        tip: '@{lang#props.image.width}',
        key: 'backgroundWidth',
        type: Props["@{number}"],
        min: 0,
        ifShow(props) {
            let img = props.backgroundImage;
            let repeat = props.backgroundRepeat;
            let support = repeat !== 'full';
            return img && support;
        }
    }, {
        tip: '@{lang#props.image.height}',
        key: 'backgroundHeight',
        type: Props["@{number}"],
        min: 0,
        ifShow(props) {
            let img = props.backgroundImage;
            let repeat = props.backgroundRepeat;
            let support = repeat != 'full';
            return img && support;
        }
    }, {
        tip: '@{lang#props.offset.hor}',
        key: 'hor',
        type: Props["@{number}"],
        ifShow(props) {
            return props.backgroundRepeat != 'full';
        }
    }, {
        tip: '@{lang#props.offset.ver}',
        key: 'ver',
        type: Props["@{number}"],
        ifShow(props) {
            return props.backgroundRepeat != 'full';
        }
    }]
}