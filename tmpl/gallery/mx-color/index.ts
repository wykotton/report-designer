/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { node } from 'magix';
import Dragdrop from '../mx-dragdrop/index';
import Monitor from '../mx-monitor/index';
Magix.applyStyle('@index.less');
let ShortCuts = ['d81e06', 'f4ea2a', '1afa29', '1296db', '13227a', 'd4237a', 'ffffff', 'e6e6e6', 'dbdbdb', 'cdcdcd', 'bfbfbf', '8a8a8a', '707070', '515151', '2c2c2c', '000000', 'ea986c', 'eeb174', 'f3ca7e', 'f9f28b', 'c8db8c', 'aad08f', '87c38f', '83c6c2', '7dc5eb', '87a7d6', '8992c8', 'a686ba', 'bd8cbb', 'be8dbd', 'e89abe', 'e8989a', 'e16632', 'e98f36', 'efb336', 'f6ef37', 'afcd51', '7cba59', '36ab60', '1baba8', '17ace3', '3f81c1', '4f68b0', '594d9c', '82529d', 'a4579d', 'db649b', 'dd6572', 'd84e06', 'e0620d', 'ea9518', 'f4ea2a', '8cbb1a', '2ba515', '0e932e', '0c9890', '1295db', '0061b2', '0061b0', '004198', '122179', '88147f', 'd3227b', 'd6204b'];
let HSV2RGB = (h, s, v) => {
    let R, G, B, X, C;
    h = (h % 360) / 60;
    C = v * s;
    X = C * (1 - Math.abs(h % 2 - 1));
    R = G = B = v - C;

    h = ~~h;
    R += [C, X, 0, 0, X, C][h];
    G += [X, C, C, X, 0, 0][h];
    B += [0, 0, X, C, C, X][h];

    let r = R * 255,
        g = G * 255,
        b = B * 255;
    return {
        r: r,
        g: g,
        b: b,
        hex: '#' + (16777216 | b | (g << 8) | (r << 16)).toString(16).slice(1)
    };
};
let RGB2HSV = (r, g, b) => {
    //if (r > 0 || g > 0 || b > 0) {
    r /= 255;
    g /= 255;
    b /= 255;
    //}
    let H, S, V, C;
    V = Math.max(r, g, b);
    C = V - Math.min(r, g, b);
    H = (C === 0 ? null : V == r ? (g - b) / C + (g < b ? 6 : 0) : V == g ? (b - r) / C + 2 : (r - g) / C + 4);
    H = (H % 6) * 60;
    S = C === 0 ? 0 : C / V;
    return {
        h: H,
        s: S,
        v: V
    };
};
export default Magix.View.extend({
    tmpl: '@index.html',
    mixins: [Dragdrop],
    init(data) {
        this.set({
            shortcuts: ShortCuts
        });
        Monitor["@{setup}"]();
        this.on('destroy', () => {
            Monitor['@{remove}'](this);
            Monitor['@{teardown}']();
        });
        this.assign(data);
    },
    assign(data) {
        let me = this;
        me['@{color}'] = data.color;
        me['@{show.alpha}'] = (data.alpha + '') == 'true';
        me['@{hsv.info}'] = {
            h: 0,
            s: 1,
            v: 1
        };
        me.set({
            clear: (data.clear + '') == 'true',
            text: data.text || '',
            disabled: (data.disabled + '') == 'true',
            align: data.align || 'left',
            textWidth: data.textWidth || 0,
            placement: data.placement || 'bottom'
        });
        return true;
    },
    render() {
        this.digest({
            alpha: this['@{show.alpha}'],
            color: this['@{color}'],
            current: this['@{color}']
        });
    },
    '@{set.hsv}'(hsv, ignoreSyncUI) {
        let me = this;
        let selfHSV = me['@{hsv.info}'];
        selfHSV.h = hsv.h;
        selfHSV.s = hsv.s;
        selfHSV.v = hsv.v;
        let rgb = HSV2RGB(hsv.h, hsv.s, hsv.v);
        let hex = rgb.hex;
        let cpickerNode = Magix.node('cz_' + me.id);
        let pickerZone = cpickerNode.clientWidth;
        let colorZone = HSV2RGB(hsv.h, 1, 1);
        cpickerNode.style.background = colorZone.hex;
        me['@{hex.color}'] = hex;
        me['@{sync.color}']();
        if (!ignoreSyncUI) {
            let selected = node('scs_' + me.id).querySelector('li[class$="@index.less:selected"]');
            if (selected) {
                selected.classList.remove('@index.less:selected');
            }
            let snode = node('si_' + me.id);
            let slider = snode.clientHeight / 2;
            let top = Math.round(selfHSV.h * pickerZone / 360 - slider);
            let cnode = node('ci_' + me.id);
            let pickerIndicator = cnode.clientWidth / 2;
            snode.style.top = top + 'px';
            top = Math.round((1 - selfHSV.v) * pickerZone - pickerIndicator);
            let left = Math.round(selfHSV.s * pickerZone - pickerIndicator);
            cnode.style.left = left + 'px';
            cnode.style.top = top + 'px';
        }
        let sc = node('sc_' + hex.substr(1, 6) + '_' + me.id);
        if (sc) {
            sc.classList.add('@index.less:selected');
        }
    },
    '@{set.color}'(hex) {
        let me = this;
        let r = parseInt(hex.substr(1, 2), 16);
        if (isNaN(r)) r = 255;
        let g = parseInt(hex.substr(3, 2), 16);
        if (isNaN(g)) g = 255;
        let b = parseInt(hex.substr(5, 2), 16);
        if (isNaN(b)) b = 255;
        let hsv = RGB2HSV(r, g, b);
        let a = parseInt(hex.substr(7, 2), 16);
        if (isNaN(a)) {
            a = 255;
        }
        me['@{hex.alpha}'] = ('0' + a.toString(16)).slice(-2);
        me['@{set.hsv}'](hsv);
        if (me['@{show.alpha}']) {
            me['@{set.alpha}'](a);
        }
    },
    '@{set.alpha}'(a) {
        let me = this;
        let ai = node('ai_' + me.id);
        let alphaWidth = node('at_' + me.id).clientWidth;
        let slider = ai.clientWidth / 2;
        a /= 255;
        a *= alphaWidth;
        a -= slider;
        ai.style.left = a + 'px';
    },
    '@{sync.color}'() {
        let me = this;
        let n = node('bc_' + me.id);
        let hex = me['@{hex.color}'];
        if (me['@{show.alpha}']) {
            node('at_' + me.id).style.background = 'linear-gradient(to right, ' + hex + '00 0%,' + hex + ' 100%)';
            hex += me['@{hex.alpha}'];
        }
        n.style.background = hex;
        let n1 = node('v_' + me.id) as HTMLInputElement;
        n1.value = hex;
    },
    '@{prevent}<contextmenu>'(e) {
        e.preventDefault();
    },
    '@{color.zone.drag}<mousedown>'(e) {
        let me = this,
            pickerZone = node('cz_' + me.id).clientWidth,
            pickerIndicator = node('ci_' + me.id).clientWidth / 2,
            offset = e.eventTarget.getBoundingClientRect(),
            left = e.pageX - offset.left - window.pageXOffset,
            top = e.pageY - offset.top - window.pageYOffset,
            s = left / pickerZone,
            v = (pickerZone - top) / pickerZone;
        me['@{set.hsv}']({
            h: me['@{hsv.info}'].h,
            s: s,
            v: v
        });
        let current = node('ci_' + me.id);
        let styles = getComputedStyle(current);
        let sleft = styles.left;
        let stop = styles.top;
        let startX = parseInt(sleft, 10);
        let startY = parseInt(stop, 10);
        let pos = e;
        me['@{drag.drop}'](e, (event) => {
            let offsetY = event.pageY - pos.pageY;
            let offsetX = event.pageX - pos.pageX;
            offsetY += startY;
            if (offsetY <= -pickerIndicator) offsetY = -pickerIndicator;
            else if (offsetY >= (pickerZone - pickerIndicator)) offsetY = pickerZone - pickerIndicator;

            offsetX += startX;

            if (offsetX <= -pickerIndicator) offsetX = -pickerIndicator;
            else if (offsetX >= (pickerZone - pickerIndicator)) offsetX = pickerZone - pickerIndicator;
            current.style.left = offsetX + 'px';
            current.style.top = offsetY + 'px';
            let s = (offsetX + pickerIndicator) / pickerZone;
            let v = (pickerZone - (offsetY + pickerIndicator)) / pickerZone;
            me['@{set.hsv}']({
                h: me['@{hsv.info}'].h,
                s: s,
                v: v
            });
        });
    },
    '@{slide.drag}<mousedown>'(e) {
        let me = this;
        let current = e.eventTarget;
        let indicator = node('si_' + me.id);
        let pickerZone = node('cz_' + me.id).clientWidth;
        let slider = indicator.clientHeight / 2;
        let offset = current.getBoundingClientRect(),
            top = e.pageY - offset.top - window.scrollY,
            h = top / pickerZone * 360;
        me['@{set.hsv}']({
            h: h,
            s: me['@{hsv.info}'].s,
            v: me['@{hsv.info}'].v
        });

        let startY = parseInt(getComputedStyle(indicator).top, 10);
        me['@{drag.drop}'](e, event => {
            let offsetY = event.pageY - e.pageY;
            offsetY += startY;
            if (offsetY <= -slider) offsetY = -slider;
            else if (offsetY >= (pickerZone - slider)) offsetY = pickerZone - slider;
            indicator.style.top = offsetY + 'px';
            let h = (offsetY + slider) / pickerZone * 360;
            me['@{set.hsv}']({
                h: h,
                s: me['@{hsv.info}'].s,
                v: me['@{hsv.info}'].v
            }, true);
        });
    },
    '@{alpha.drag}<mousedown>'(e: Magix5.MagixMouseEvent) {
        let current = e.eventTarget;
        let me = this;
        let indicator = node('ai_' + me.id);
        let alphaWidth = node('at_' + me.id).clientWidth;
        let slider = indicator.clientWidth / 2;
        let offset = current.getBoundingClientRect(),
            left = e.pageX - offset.left,
            a = (left / alphaWidth * 255) | 0;
        me['@{hex.alpha}'] = ('0' + a.toString(16)).slice(-2);
        me['@{set.alpha}'](a);
        me['@{sync.color}']();
        let styles = getComputedStyle(indicator);
        let startX = parseInt(styles.left, 10);
        me['@{drag.drop}'](e, (event) => {
            let offsetX = event.pageX - e.pageX;
            offsetX += startX;
            if (offsetX <= -slider) offsetX = -slider;
            else if (offsetX >= (alphaWidth - slider)) offsetX = alphaWidth - slider;
            indicator.style.left = offsetX + 'px';
            let a = Math.round((offsetX + slider) / alphaWidth * 255);
            me['@{hex.alpha}'] = ('0' + a.toString(16)).slice(-2);
            me['@{sync.color}']();
        });
    },
    '@{enter}<click>'() {
        let me = this;
        me['@{hide}']();
        let n = node('v_' + me.id) as HTMLInputElement;
        let c = n.value;
        if (c != me['@{color}']) {
            me.digest({
                color: c,
                current: c
            });
            Magix.dispatch(me.root, 'input', {
                color: me['@{color}'] = c
            });
        }
    },
    '@{shortcuts.picked}<click>'(e) {
        this['@{set.color}'](e.params.color);
        e.eventTarget.classList.add('@index.less:selected');
    },
    '@{inside}'(node) {
        return Magix.inside(node, this.root);
    },
    '@{show}'() {
        let n = node('bd_' + this.id);
        let d = getComputedStyle(n).display;
        if (d == 'none') {
            n.style.display = 'block';
            Monitor["@{add}"](this);
            node('root_' + this.id).classList.add('@scoped.style:input-focus');
            if (!this['@{init.sync.color}']) {
                this.digest({
                    renderUI: true
                }, null, () => {
                    this['@{set.color}'](this['@{color}']);
                });
                this['@{init.sync.color}'] = 1;
            }
        }
    },
    '@{hide}'() {
        let n = node('bd_' + this.id);
        let d = getComputedStyle(n).display;
        if (d != 'none') {
            node('root_' + this.id).classList.remove('@scoped.style:input-focus');
            n.style.display = 'none';
            Monitor["@{remove}"](this);
        }
    },
    '@{toggle}<click>'() {
        if (this.get('disabled')) return;
        let n = node('bd_' + this.id);
        let d = getComputedStyle(n).display;
        if (d == 'none') {
            this['@{show}']();
        } else {
            this['@{hide}']();
        }
    },
    '@{clear.color}<click>'() {
        if (this.get('disabled')) return;
        let me = this, c = '';
        if (me['@{init.sync.color}']) {
            let cr = (node('v_' + me.id) as HTMLInputElement).value;
            me['@{hide}']();
            me.digest({
                color: '',
                current: cr
            });
        } else {
            me.digest({
                color: ''
            });
        }
        Magix.dispatch(me.root, 'input', {
            color: me['@{color}'] = c
        });
    }
});