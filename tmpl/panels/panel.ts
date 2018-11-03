/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { node, State } from 'magix';
import Cursor from '../gallery/mx-pointer/cursor';
import DragDrop from '../gallery/mx-dragdrop/index';
Magix.applyStyle('@panel.less');
let MinWidth = 100;
let ZIndex = 300;
let Panels = [];
let PanelsManager = {
    '@{add}'(view) {
        Panels.push(view);
    },
    '@{remove}'(view) {
        for (let i = Panels.length; i--;) {
            if (Panels[i] == view) {
                Panels.splice(i, 1);
                break;
            }
        }
        this['@{z-index}']();
    },
    '@{z-index}'() {
        for (let i = Panels.length; i--;) {
            Panels[i]['@{set.z-index}'](ZIndex + i);
        }
    },
    '@{top}'(view) {
        if (Panels[Panels.length - 1] != view) {
            for (let i = Panels.length; i--;) {
                if (Panels[i] == view) {
                    Panels.splice(i, 1);
                    break;
                }
            }
            Panels.push(view);
            this['@{z-index}']();
        }
    }
};
export default Magix.View.extend({
    tmpl: '@panel.html',
    mixins: [DragDrop],
    init(data) {
        PanelsManager["@{add}"](this);
        this.on('destroy', () => {
            PanelsManager["@{remove}"](this);
        });
        this['@{p.close}'] = data.close;
        this.set({
            icon: data.icon,
            title: data.title,
            width: data.width,
            height: data.height,
            left: data.left,
            top: data.top,
            right: data.right,
            view: data.view,
            resizeX: data.resizeX,
            resizeY: data.resizeY
        });
    },
    render() {
        this.digest({
            zIndex: ZIndex + Panels.length
        });
    },
    '@{drag.move}<mousedown>'(e) {
        let n = node('p_' + this.id);
        let styles = n.style;
        let startX = this.get('left');
        let width = this.get('width');
        let dockRight = 0;
        if (startX === undefined) {
            dockRight = 1;
            startX = this.get('right');
        }
        let startY = this.get('top');
        let dockKey = dockRight ? 'right' : 'left';
        let showedCursor = 0;
        let target = e.eventTarget;
        this['@{drag.drop}'](e, ex => {
            if (!showedCursor) {
                showedCursor = 1;
                Cursor["@{show}"](target);
            }
            let offsetX = (dockRight ? e.pageX - ex.pageX : ex.pageX - e.pageX) + startX;
            if (offsetX < 0) {
                offsetX = 0;
            } else if (offsetX + width > window.innerWidth) {
                offsetX = window.innerWidth - width;
            }
            let offsetY = ex.pageY - e.pageY + startY;
            if (offsetY < 0) {
                offsetY = 0;
            } else if (offsetY + 18 > window.innerHeight) {
                offsetY = window.innerHeight - 18;
            }
            styles[dockKey] = offsetX + 'px';
            styles.top = offsetY + 'px';
            this.set({
                [dockKey]: offsetX,
                top: offsetY
            });
        }, () => {
            Cursor["@{hide}"]();
        });
    },
    '@{start.resize}<mousedown>'(e) {
        let { w: resizeWidth } = e.params;
        let startWidth = this.get('width');
        let startHeight = this.get('height');
        let startRight = this.get('right');
        let cNode = node('c_' + this.id);
        cNode.classList.add('@panel.less:content-outer-disable-anim');
        let cStyles = cNode.style;
        let pStyles = node('p_' + this.id).style;
        let showedCursor = 0;
        let target = e.eventTarget;
        this['@{drag.drop}'](e, ex => {
            if (!showedCursor) {
                showedCursor = 1;
                Cursor["@{show}"](target);
            }
            if (resizeWidth) {
                let offset = ex.pageX - e.pageX;
                if (offset + startWidth < MinWidth) {
                    offset = MinWidth - startWidth;
                }
                let offsetX = offset + startWidth;
                pStyles.width = offsetX + 'px';
                if (startRight || startHeight === 0) {
                    pStyles.right = (startRight - offset) + 'px';
                    this.set({
                        right: startRight - offset
                    });
                }
                this.set({
                    width: offsetX
                });
            } else {
                let offsetY = e.pageY - ex.pageY + startHeight;
                cStyles.height = `calc(100vh - ${offsetY}px)`;
                this.digest({
                    height: offsetY
                });
            }
        }, () => {
            Cursor["@{hide}"]();
            cNode.classList.remove('@panel.less:content-outer-disable-anim');
        });
    },
    '@{set.z-index}'(z) {
        node('p_' + this.id).style.zIndex = z;
    },
    '@{update.z-index}<mousedown>'() {
        PanelsManager["@{top}"](this);
    },
    '@{show}'() {
        PanelsManager["@{top}"](this);
    },
    '@{hide}'() {

    },
    '@{toggle.height}<click>'() {
        this.digest({
            shrink: !this.get('shrink')
        });
    },
    '@{close}<click>'() {
        let c = this['@{p.close}'];
        if (c) {
            Magix.toTry(c);
        }
    }
});