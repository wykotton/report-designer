/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { State, node } from 'magix';
import Elements from '../elements/index';
import Dragdrop from '../gallery/mx-dragdrop/index';
import Follower from '../gallery/mx-pointer/follower';
Magix.applyStyle('@header.less');
let Fullscreens = ['requestFullscreen', 'webkitRequestFullScreen', 'webkitRequestFullscreen', 'mozRequestFullScreen', 'msRequestFullscreen'];
export default Magix.View.extend({
    tmpl: '@header.html',
    mixins: [Dragdrop],
    render() {
        this.digest({
            elements: Elements["@{element.list}"]()
        });
    },
    '@{add.element}<mousedown>'(e) {
        let { ctrl } = e.params;
        Follower["@{update}"](ctrl.icon);
        let moved = false, hoverNode = null;
        State.set({
            '@{memory.cache.element.ctrl}': ctrl
        });
        this['@{drag.drop}'](e, ex => {
            Follower["@{show}"](ex);
            moved = true;
        }, (ex: Magix.DOMEvent) => {
            Follower["@{hide}"]();
            if (!moved) {
                State.fire('@{event#toolbox.add.element}', {
                    pageX: (Math.random() * 50) | 0,
                    pageY: (Math.random() * 50) | 0
                });
                return;
            }
            if (ex) {
                hoverNode = Dragdrop["@{from.point}"](ex.clientX, ex.clientY);
                State.fire('@{event#toolbox.drag.element.drop}', {
                    node: hoverNode,
                    pageX: ex.pageX,
                    pageY: ex.pageY
                });
            }
        });
    },
    '@{preview}<click>'() {
        let cavans = node('stage_outer');
        for (let fs of Fullscreens) {
            if (cavans[fs]) {
                cavans[fs]();
                break;
            }
        }
    },
    '$doc<webkitfullscreenchange,mozfullscreenchange,fullscreenchange>'(e) {
        let element = document.fullscreenElement ||
            document.webkitCurrentFullScreenElement ||
            document.mozFullScreenElement || null;
        State.fire('@{event#preview}', {
            fullscreen: true,
            full: !!element
        });
    }
});