/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Props from '../../designer/props';
import I18n from '../../i18n/index';
export default {
    title: '@{lang#elements.page}',
    getProps() {
        return {
            width: 900,
            height: 500,
            background: '#ffffff',
            backgroundImage: '',
            backgroundRepeat: 'full',
            backgroundWidth: 0,
            backgroundHeight: 0
        }
    },
    props: [{
        tip: '@{lang#props.page.min.width}',
        key: 'width',
        type: Props["@{number}"],
        min: 0
    }, {
        tip: '@{lang#props.page.min.height}',
        key: 'height',
        type: Props["@{number}"],
        min: 0
    }, {
        type: Props["@{spliter}"]
    }, {
        tip: '@{lang#props.background}',
        key: 'background',
        type: Props["@{color}"]
    }, {
        tip: '@{lang#props.background.image}',
        dockTop: true,
        key: 'backgroundImage',
        type: Props["@{image}"],
        refresh: true,
        write(page, e) {
            page.backgroundWidth = e.width;
            page.backgroundHeight = e.height;
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
        ifShow(page) {
            return page.backgroundImage;
        }
    }]
}