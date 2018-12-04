import Magix from 'magix';
import I18n from '../i18n/index';
let MenuSpliter = {
    spliter: true
};
let MenuAll = {
    id: 0,
    text: '@{lang#menu.select.all}',
    short: ' (Ctrl+A)'
};
let MenuCopy = {
    id: 1,
    text: '@{lang#menu.copy}',
    short: ' (Ctrl+C)'
};
let MenuCut = {
    id: 14,
    text: '@{lang#menu.cut}',
    short: ' (Ctrl+X)'
}
let MenuPaste = {
    id: 2,
    text: '@{lang#menu.paste}',
    short: ' (Ctrl+V)'
};
let MenuUp = {
    id: 5,
    text: '@{lang#menu.move.up}'
};
let MenuDown = {
    id: 6,
    text: '@{lang#menu.move.down}'
};
let MenuTop = {
    id: 3,
    text: '@{lang#menu.to.top}'
};
let MenuBottom = {
    id: 4,
    text: '@{lang#menu.to.bottom}'
};
let MenuDelete = {
    id: 7,
    text: '@{lang#menu.delete}',
    short: ' (Delete)'
};
let Cache = {};
let TranslateMenu = menus => {
    return (lang) => {
        if (!menus['@{menu@u.id}']) {
            menus['@{menu@u.id}'] = Magix.guid('_m');
        }
        let key = lang + menus['@{menu@u.id}'];
        if (!Cache[key]) {
            let a = [];
            for (let m of menus) {
                if (m.spliter) {
                    a.push(m);
                } else {
                    a.push({
                        id: m.id,
                        text: I18n(m.text) + (m.short || '')
                    });
                }
            }
            Cache[key] = a;
        }
        return Cache[key];
    };
};
export default {
    allId: MenuAll.id,
    pasteId: MenuPaste.id,
    topId: MenuTop.id,
    upId: MenuUp.id,
    bottomId: MenuBottom.id,
    downId: MenuDown.id,
    cutId: MenuCut.id,
    copyId: MenuCopy.id,
    deleteId: MenuDelete.id,
    singleElement: TranslateMenu([MenuCopy, MenuCut, MenuDelete, MenuSpliter, MenuUp, MenuTop, MenuSpliter, MenuDown, MenuBottom]),
    multipleElement: TranslateMenu([MenuCopy, MenuCut, MenuDelete]),
    stage: TranslateMenu([MenuAll, MenuPaste])
}