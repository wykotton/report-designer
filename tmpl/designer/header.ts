/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { State, node } from 'magix';
import Elements from '../elements/index';
import Dragdrop from '../gallery/mx-dragdrop/index';
import Select from '../gallery/mx-pointer/select';
import Cursor from '../gallery/mx-pointer/cursor';
Magix.applyStyle('@header.less');
let Fullscreens = ['requestFullscreen',
    'webkitRequestFullScreen',
    'webkitRequestFullscreen',
    'mozRequestFullScreen',
    'msRequestFullscreen'];
export default Magix.View.extend({
    tmpl: '@header.html',
    mixins: [Dragdrop],
    render() {
        this.digest({
            elements: Elements["@{element.list}"]()
        });
    },
    '@{add.element}<mousedown>'(e) {
        let { ctrl, hide } = e.params;
        let moreNode = e.eventTarget.parentNode;
        //Follower["@{update}"](ctrl.icon);
        let moved = false, hoverNode = null;
        State.set({
            '@{memory.cache.element.ctrl}': ctrl
        });
        let props = ctrl.getProps(0, 0);
        let { width, height } = props;
        let scale = State.get('@{stage.scale}');
        width *= scale;
        height *= scale;

        Select["@{init}"]();
        Cursor["@{root.show.by.type}"]('move');
        this['@{drag.drop}'](e, ex => {
            if (!moved) {
                if (hide) {
                    moreNode.style.display = 'none';
                }
            }
            //Follower["@{show}"](ex);
            State.fire('@{event#toolbox.drag.element.move}', {
                width,
                height,
                node: Dragdrop["@{from.point}"](ex.clientX, ex.clientY),
                pageX: ex.pageX - width / 2,
                pageY: ex.pageY - height / 2
            });
            moved = true;
        }, (ex: Magix5.MagixMouseEvent) => {
            //Follower["@{hide}"]();
            if (hide) {
                moreNode.style.display = '';
            }
            Select["@{hide}"]();
            Cursor["@{root.hide}"]();
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
                    pageX: ex.pageX - width / 2,
                    pageY: ex.pageY - height / 2
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
        let doc = document as Document & {
            fullscreenElement: HTMLElement
            webkitCurrentFullScreenElement: HTMLElement
            mozFullScreenElement: HTMLElement
        };
        let element = doc.fullscreenElement ||
            doc.webkitCurrentFullScreenElement ||
            doc.mozFullScreenElement || null;
        State.fire('@{event#preview}', {
            fullscreen: true,
            full: !!element
        });
    }
});