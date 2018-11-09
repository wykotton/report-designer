/*
    author:xinglie.lkf@alibaba-inc.com
 */
import Magix from 'magix';
import './alert';
import './confirm';
Magix.applyStyle('@index.less');
let DialogZIndex = 500;
let CacheList = [];
let RemoveCache = (view) => {
    for (let i = CacheList.length - 1, one; i >= 0; i--) {
        one = CacheList[i];
        if (one.id == view.id) {
            CacheList.splice(i, 1);
            break;
        }
    }
};
export default Magix.View.extend({
    tmpl: '@index.html',
    init(extra) {
        let me = this;
        let app = Magix.node('app');
        let root = Magix.node(me.id);
        me.on('destroy', () => {
            RemoveCache(me);
            DialogZIndex -= 2;
            if (DialogZIndex == 500) {
                app.classList.remove('@index.less:blur');
            }
            Magix.dispatch(root, 'close');
            root.parentNode.removeChild(root);
        });
        if (!Magix.has(extra, 'closable')) {
            extra.closable = true;
        }
        me.set(extra);
        if (DialogZIndex == 500) {
            app.classList.add('@index.less:blur');
        }
        DialogZIndex += 2;
        CacheList.push(me);
    },
    render() {
        let me = this;
        me.digest({
            zIndex: DialogZIndex
        }, null, () => {
            let data = me.get();
            setTimeout(me.wrapAsync(() => {
                Magix.node(me.id).style.display = 'block';
                Magix.node('focus_' + me.id).focus();
            }), 30);
            me.owner.mountVframe('cnt_' + me.id, data.view, data);
            setTimeout(me.wrapAsync(() => {
                me.digest({
                    removeClass: true
                });
            }), 300);
        });
    },
    '@{notify.main.view.unload}'(e) {
        let vf = Magix.Vframe.get('cnt_' + this.id);
        vf.invoke('fire', ['unload', e]);
    },
    '@{close}<click>'() {
        Magix.dispatch(this.id, 'dlg_close');
    },
    '$doc<keyup>'(e) {
        if (e.keyCode == 27) { //esc
            let dlg = CacheList[CacheList.length - 1];
            if (dlg == this && dlg.get('closable')) {
                Magix.dispatch(this.id, 'dlg_close');
            }
        }
    }
}, {
        '@{dialog.show}'(view, options) {
            let id = Magix.guid('dlg_');
            document.body.insertAdjacentHTML('beforeend', '<div id="' + id + '" style="display:none" />');
            let vf = view.owner.mountVframe(id, '@moduleId', options);
            let node = Magix.node(id);
            let suspend;
            let whenClose = () => {
                if (!node['@{is.closing}'] && !suspend) {
                    let resume = () => {
                        node['@{is.closing}'] = 1;
                        node = Magix.node('body_' + id);
                        node.classList.add('@index.less:anim-body-out');
                        node = Magix.node('mask_' + id);
                        node.classList.add('@index.less:anim-mask-out');
                        setTimeout(() => {
                            if (view.owner) {
                                view.owner.unmountVframe(id);
                            }
                        }, 200);
                    };
                    let e = {
                        p: 0,
                        prevent() {
                            suspend = 1;
                        },
                        resolve() {
                            e.p = 1;
                            suspend = 0;
                            resume();
                        },
                        reject() {
                            e.p = 1;
                            suspend = 0;
                        }
                    };
                    vf.invoke('@{notify.main.view.unload}', [e]);
                    if (!suspend && !e.p) {
                        resume();
                    }
                }
            };
            node.addEventListener('dlg_close', whenClose);
            return node;
        },
        alert(content, enterCallback, title) {
            this.confirm(content, enterCallback, null, title, 'alert');
        },
        confirm(content, enterCallback, cancelCallback, title, view) {
            this.mxDialog('@./' + (view || 'confirm'), {
                body: content,
                cancelCallback: cancelCallback,
                enterCallback: enterCallback,
                title: title,
                modal: true,
                width: 300,
                closable: false,
                left: (window.innerWidth - 300) / 2,
                top: Math.max((window.innerHeight - 220) / 2, 0)
            });
        },
        mxDialog(view, options) {
            let me = this;
            let dlg;
            let closeCallback;
            let dOptions = {
                view: view
            } as {
                    view: string
                    width: number
                    left: number
                    top: number
                    dialog: {
                        close: () => void
                    }
                };
            Magix.use(view, me.wrapAsync(V => {
                let key = '$dlg_' + view;
                if (me[key]) return;
                me[key] = 1;
                Magix.mix(dOptions, V.dialogOptions);
                Magix.mix(dOptions, options);
                if (!dOptions.width) dOptions.width = 500;
                if (!dOptions.left) dOptions.left = (window.innerWidth - dOptions.width) / 2;
                if (!dOptions.top) dOptions.top = 100;
                dOptions.dialog = {
                    close() {
                        if (dlg) {
                            Magix.dispatch(dlg, 'dlg_close');
                        }
                    }
                };
                dlg = me['@{dialog.show}'](me, dOptions);
                dlg.addEventListener('close', () => {
                    delete me[key];
                    if (closeCallback) {
                        closeCallback();
                    }
                });
            }));
            return {
                close() {
                    if (dlg) {
                        Magix.dispatch(dlg, 'dlg_close');
                    }
                },
                whenClose(fn) {
                    closeCallback = fn;
                }
            };
        }
    });