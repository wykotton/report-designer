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
let MenuDelete = {
    id: 7,
    text: '@{lang#menu.delete}',
    short: ' (Delete)'
};
let Cache = {};
let TranslateMenu = menus => {
    return (lang) => {
        if (!menus['@{uid}']) {
            menus['@{uid}'] = Magix.guid('_m');
        }
        let key = lang + menus['@{uid}'];
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
    cutId: MenuCut.id,
    copyId: MenuCopy.id,
    deleteId: MenuDelete.id,
    singleElement: TranslateMenu([MenuCopy, MenuCut, MenuSpliter, MenuDelete]),
    multipleElement: TranslateMenu([MenuCopy, MenuCut, MenuSpliter, MenuDelete]),
    stage: TranslateMenu([MenuAll, MenuPaste])
}