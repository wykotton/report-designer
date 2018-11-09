//#snippet;
//#uncheck = jsThis,jsLoop;
//#exclude = loader,allProcessor;
/*!3.8.12 Licensed MIT*/
/*
author:kooboy_li@163.com
loader:cmd
enables:style,viewInit,resource,viewMerge,autoEndUpdate,linkage,updaterQuick,state,viewProtoMixins,simpleState,service,ceach

optionals:base,updaterDOM,updaterAsync,serviceCombine,servicePush,router,tipRouter,tipLockUrlRouter,edgeRouter,forceEdgeRouter,urlRewriteRouter,updateTitleRouter,cnum,defaultView,viewInitAsync,configIni,viewChildren,dispatcherRecast
*/
define('magix', () => {
    if (typeof DEBUG == 'undefined') window.DEBUG = true;
    let G_Type = o => Object.prototype.toString.call(o).slice(8, -1);
let G_IsType = type => o => G_Type(o) == type;
let G_IsObject = G_IsType('Object');
let G_IsArray = G_IsType('Array');
let $ = selector => G_DOCUMENT.querySelectorAll(selector);
let G_Trigger = (element, type, data) => {
    let e = G_DOCUMENT.createEvent('Events');
    e.initEvent(type, true, true);
    for (let p in data) {
        e[p] = data[p];
    }
    element.dispatchEvent(e);
};
let G_TargetMatchSelector = (element, selector) => {
    if (!selector || !element || element.nodeType !== 1) return 0;
    let matchesSelector = element.matchesSelector || element.webkitMatchesSelector || element.mozMatchesSelector || element.oMatchesSelector;
    return matchesSelector.call(element, selector);
};
let G_MxId = e => e._mx || (e._mx = G_Id('e'));
let G_EventHandlers = {};
let returnTrue = () => true,
    returnFalse = () => false,
    eventMethods = {
        preventDefault: 'isDefaultPrevented',
        //stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
    };

let G_EventCompatible = e => {
    if (!e.isDefaultPrevented) {
        for (let key in eventMethods) {
            let value = eventMethods[key];
            let src = e[key];
            e[key] = (...a) => {
                e[value] = returnTrue;
                return src && src.apply(e, a);
            };
            e[value] = returnFalse;
        }
        if (e.defaultPrevented !== undefined ? e.defaultPrevented :
            'returnValue' in e ? e.returnValue === false :
                e.getPreventDefault && e.getPreventDefault())
            e.isDefaultPrevented = returnTrue;
    }
    return e;
};
let G_AddEvent = (element, type, data, fn) => {
    let id = G_MxId(element);
    let collections = G_EventHandlers[id] || (G_EventHandlers[id] = []);
    let h = {
        'a': data && data.i,
        'b': fn,
        'c': type,
        'd'(e) {
            e = G_EventCompatible(e);
            //if (e.isImmediatePropagationStopped()) return;
            fn.call(element, e, data);
        }
    };
    collections.push(h);
    element.addEventListener(type, h['d'], data && data.m);
};
let G_RemoveEvent = (element, type, data, cb) => {
    let id = G_MxId(element);
    let collections = G_EventHandlers[id];
    if (collections) {
        let found;
        for (let c, i = collections.length; i--;) {
            c = collections[i];
            if (c['c'] == type && c['b'] === cb) {
                let cd = c['a'];
                if (!data || (data && data.i == cd)) {
                    found = c;
                    collections.splice(i, 1);
                    break;
                }
            }
        }
        if (found) {
            element.removeEventListener(type, found['d'], data && data.m);
        }
    }
};
let G_DOMGlobalProcessor = (e, d) => {
    //d = e.data;
    e.eventTarget = d.e;
    G_ToTry(d.f, e, d.v);
};
let G_DOMEventLibBind = (node, type, cb, remove, scope) => {
    if (remove) {
        G_RemoveEvent(node, type, scope, cb);
    } else {
        G_AddEvent(node, type, scope, cb);
    }
};
    let G_COUNTER = 0;
let G_EMPTY = '';
let G_EMPTY_ARRAY = [];
let G_COMMA = ',';
let G_NULL = null;
let G_WINDOW = window;
let G_Undefined = void G_COUNTER;
let G_DOCUMENT = document;
let Timeout = G_WINDOW.setTimeout;
let G_CHANGED = 'changed';
let G_CHANGE = 'change';
let G_PAGE_UNLOAD = 'pageunload';
let G_VALUE = 'value';
let G_Tag_Key = 'mxs';
let G_Tag_Attr_Key = 'mxa';
let G_Tag_View_Key = 'mxv';
let G_Tag_View_Owner = 'mxo';
let G_HashKey = '#';
function G_NOOP() { }
let JSONStringify = JSON.stringify;
let G_DOCBODY; //initilize at vframe_root
/*
    关于spliter
    出于安全考虑，使用不可见字符\u0000，然而，window手机上ie11有这样的一个问题：'\u0000'+"abc",结果却是一个空字符串，好奇特。
 */
let G_SPLITER = '\x1e';
let Magix_StrObject = 'object';
let G_PROTOTYPE = 'prototype';
let G_PARAMS = 'params';
let G_PATH = 'path';
let G_MX_VIEW = 'mx-view';
// let Magix_PathRelativeReg = /\/\.(?:\/|$)|\/[^\/]+?\/\.{2}(?:\/|$)|\/\/+|\.{2}\//; // ./|/x/../|(b)///
// let Magix_PathTrimFileReg = /\/[^\/]*$/;
// let Magix_ProtocalReg = /^(?:https?:)?\/\//i;
let Magix_PathTrimParamsReg = /[#?].*$/;
let Magix_ParamsReg = /([^=&?\/#]+)=?([^&#?]*)/g;
let Magix_IsParam = /(?!^)=|&/;
let G_Id = prefix => (prefix || 'mx_') + G_COUNTER++;

let Magix_Cfg = {
    rootId: G_Id(),
    
    error(e) {
        throw e;
    }
};

let G_GetById = id => typeof id == Magix_StrObject ? id : G_DOCUMENT.getElementById(id);
let G_IsPrimitive = args => !args || typeof args != Magix_StrObject;
let G_Set = (newData, oldData, keys, unchanged) => {
    let changed = 0,
        now, old, p;
    for (p in newData) {
        now = newData[p];
        old = oldData[p];
        if ((!G_IsPrimitive(now) || old !== now) && !G_Has(unchanged, p)) {
            keys[p] = 1;
            changed = 1;
        }
        oldData[p] = now;
    }
    return changed;
};
let G_NodeIn = (a, b, r) => {
    a = G_GetById(a);
    b = G_GetById(b);
    if (a && b) {
        r = a == b;
        if (!r) {
            try {
                r = (b.compareDocumentPosition(a) & 16) == 16;
            } catch (_magix) { }
        }
    }
    return r;
};

let {
    assign: G_Assign,
     keys: G_Keys,
    hasOwnProperty: Magix_HasProp
} = Object;


let Header = document.head;
let Temp = document.createElement('div');
let GA = Temp.getAttribute;
let G_GetAttribute = (node, attr) => GA.call(node, attr);
let View_ApplyStyle = (key, css) => {
    if (DEBUG && G_IsArray(key)) {
        for (let i = 0; i < key.length; i += 2) {
            View_ApplyStyle(key[i], key[i + 1]);
        }
        return;
    }
    if (css && !View_ApplyStyle[key]) {
        View_ApplyStyle[key] = 1;
        if (DEBUG) {
            if (key.indexOf('$throw_') === 0) {
                throw new Error(css);
            }
            Temp.innerHTML = `<style id="${key}">${css}`;
            Header.appendChild(Temp.firstChild);
        } else {
            Temp.innerHTML = `<style>${css}`;
            Header.appendChild(Temp.firstChild);
        }
    }
};

let IdIt = n => G_GetAttribute(n, 'id') || (n.id = G_Id());
let G_ToTry = (fns, args, context, r, e) => {
    args = args || G_EMPTY_ARRAY;
    if (!G_IsArray(fns)) fns = [fns];
    if (!G_IsArray(args)) args = [args];
    for (e of fns) {
        try {
            r = e && e.apply(context, args);
        } catch (x) {
            Magix_Cfg.error(x);
        }
    }
    return r;
};

let G_Has = (owner, prop) => owner && Magix_HasProp.call(owner, prop); //false 0 G_NULL '' undefined
let G_TranslateData = (data, params) => {
    let p, val;
    if (G_IsPrimitive(params)) {
        p = params + G_EMPTY;
        if (p[0] == G_SPLITER && G_Has(data, p)) {
            params = data[p];
        }
    } else {
        for (p in params) {
            val = params[p];
            val = G_TranslateData(data, val);
            params[p] = val;
        }
    }
    return params;
};
    let Magix_CacheSort = (a, b) =>   b.f - a.f || b.t - a.t;
/**
 * Magix.Cache 类
 * @name Cache
 * @constructor
 * @param {Integer} [max] 缓存最大值，默认20
 * @param {Integer} [buffer] 缓冲区大小，默认5
 * @param {Function} [remove] 当缓存的元素被删除时调用
 * @example
 * let c = new Magix.cache(5,2);//创建一个可缓存5个，且缓存区为2个的缓存对象
 * c.set('key1',{});//缓存
 * c.get('key1');//获取
 * c.del('key1');//删除
 * c.has('key1');//判断
 * //注意：缓存通常配合其它方法使用，在Magix中，对路径的解析等使用了缓存。在使用缓存优化性能时，可以达到节省CPU和内存的双赢效果
 */
function G_Cache(max, buffer, remove, me) {
    me = this;
    me.c = [];
    me.b = buffer || 5; //buffer先取整，如果为0则再默认5
    me.x = me.b + (max || 20);
    me.r = remove;
}

G_Assign(G_Cache[G_PROTOTYPE], {
    /**
     * @lends Cache#
     */
    /**
     * 获取缓存的值
     * @param  {String} key
     * @return {Object} 初始设置的缓存对象
     */
    get(key) {
        let me = this;
        let c = me.c;
        let r = c[G_SPLITER + key];
        if (r) {
            r.f++;
            r.t = G_COUNTER++;
            //console.log(r.f);
            r = r.v;
            //console.log('hit cache:'+key);
        }
        return r;
    },
    
    
    /**
     * 循环缓存
     * @param  {Function} cb 回调
     * @param  {Object} [ops] 回调时传递的额外参数
     * @beta
     * @module ceach|service
     */
    each(cb, ops, me, c, i) {
        me = this;
        c = me.c;
        for (i of c) {
            cb(i.v, ops, me);
        }
    },
    
    /**
     * 设置缓存
     * @param {String} key 缓存的key
     * @param {Object} value 缓存的对象
     */
    set(okey, value) {
        let me = this;
        let c = me.c;

        let key = G_SPLITER + okey;
        let r = c[key];
        let t = me.b,
            f;
        if (!r) {
            if (c.length >= me.x) {
                c.sort(Magix_CacheSort);
                while (t--) {
                    
                    r = c.pop();
                    
                    //为什么要判断r.f>0,考虑这样的情况：用户设置a,b，主动删除了a,重新设置a,数组中的a原来指向的对象残留在列表里，当排序删除时，如果不判断则会把新设置的删除，因为key都是a
                    //
                    if (r.f > 0) me.del(r.o); //如果没有引用，则删除
                    
                }
                
            }
            r = {
                
                o: okey
            };
            c.push(r);
            c[key] = r;
        }
        r.v = value;
        r.f = 1;
        r.t = G_COUNTER++;
    },
    /**
     * 删除缓存
     * @param  {String} key 缓存key
     */
    del(k) {
        k = G_SPLITER + k;
        let c = this.c;
        let r = c[k],
            m = this.r;
        if (r) {
            r.f = -1;
            r.v = G_EMPTY;
            delete c[k];
            if (m) {
                G_ToTry(m, r.o);
            }
        }
    },
    /**
     * 检测缓存中是否有给定的key
     * @param  {String} key 缓存key
     * @return {Boolean}
     */
    has(k) {
        return G_Has(this.c, G_SPLITER + k);
    }
});
    
    let G_Require = (name, fn) => {
        if (name) {
            let a = [], n;
            
                if (G_WINDOW.seajs) {
                    seajs.use(name, (...g) => {
                        for (let m of g) {
                            a.push(m && m.__esModule && m.default || m);
                        }
                        if (fn) fn(...a);
                    });
                } else {
                    if (!G_IsArray(name)) name = [name];
                    for (n of name) {
                        n = require(n);
                        a.push(n && n.__esModule && n.default || n);
                    }
                    if (fn) fn(...a);
                }
        } else {
            fn();
        }
    };
    function T() { }
let G_Extend = (ctor, base, props, statics, cProto) => {
    //bProto.constructor = base;
    T[G_PROTOTYPE] = base[G_PROTOTYPE];
    cProto = new T();
    G_Assign(cProto, props);
    G_Assign(ctor, statics);
    cProto.constructor = ctor;
    ctor[G_PROTOTYPE] = cProto;
    return ctor;
};
    let Safeguard = data => data;
if (DEBUG && window.Proxy) {
    let ProxiesPool = new Map();
    Safeguard = (data, getter, setter, root) => {
        if (G_IsPrimitive(data)) {
            return data;
        }
        let build = (prefix, o) => {
            let key = getter + '\x01' + setter;
            let cached = ProxiesPool.get(o);
            if (cached && cached.key == key) {
                return cached.entity;
            }
            if (o['\x1e_sf_\x1e']) {
                return o;
            }
            let entity = new Proxy(o, {
                set(target, property, value) {
                    if (!setter && !prefix) {
                        throw new Error('avoid writeback,key: ' + prefix + property + ' value:' + value + ' more info: https://github.com/thx/magix/issues/38');
                    }
                    target[property] = value;
                    if (setter) {
                        setter(prefix + property, value);
                    }
                    return true;
                },
                get(target, property) {
                    if (property == '\x1e_sf_\x1e') {
                        return true;
                    }
                    let out = target[property];
                    if (!prefix && getter) {
                        getter(property);
                    }
                    if (!root && G_Has(target, property) &&
                        (G_IsArray(out) || G_IsObject(out))) {
                        return build(prefix + property + '.', out);
                    }
                    return out;
                }
            });
            ProxiesPool.set(o, {
                key,
                entity
            });
            return entity;
        };
        return build('', data);
    };
}
    let Magix_PathToObjCache = new G_Cache();
let Magix_Booted = 0;
//let Magix_PathCache = new G_Cache();
let Magix_ParamsObjectTemp;
let Magix_ParamsFn = (match, name, value) => {
    try {
        value = decodeURIComponent(value);
    } catch (_magix) {

    }
    Magix_ParamsObjectTemp[name] = value;
};
/**
 * 路径
 * @param  {String} url  参考地址
 * @param  {String} part 相对参考地址的片断
 * @return {String}
 * @example
 * http://www.a.com/a/b.html?a=b#!/home?e=f   /   => http://www.a.com/
 * http://www.a.com/a/b.html?a=b#!/home?e=f   ./     =>http://www.a.com/a/
 * http://www.a.com/a/b.html?a=b#!/home?e=f   ../../    => http://www.a.com/
 * http://www.a.com/a/b.html?a=b#!/home?e=f   ./../  => http://www.a.com/
 * //g.cn/a.html
 */
/*let G_Path = function(url, part) {
    let key = url + G_SPLITER + part;
    let result = Magix_PathCache.get(key),
        domain = G_EMPTY,
        idx;
    if (!Magix_PathCache.has(key)) { //有可能结果为空，url='' path='';
        let m = url.match(Magix_ProtocalReg);
        if (m) {
            idx = url.indexOf(Magix_SLASH, m[0].length);
            if (idx < 0) idx = url.length;
            domain = url.slice(0, idx);
            url = url.slice(idx);
        }
        url = url.replace(Magix_PathTrimParamsReg, G_EMPTY).replace(Magix_PathTrimFileReg, Magix_SLASH);
        if (!part.indexOf(Magix_SLASH)) {
            url = G_EMPTY;
        }
        result = url + part;
        console.log('url', url, 'part', part, 'result', result);
        while (Magix_PathRelativeReg.test(result)) {
            result = result.replace(Magix_PathRelativeReg, Magix_SLASH);
        }
        Magix_PathCache.set(key, result = domain + result);
    }
    return result;
};*/

/**
 * 把路径字符串转换成对象
 * @param  {String} path 路径字符串
 * @return {Object} 解析后的对象
 * @example
 * let obj = Magix.parseUri('/xxx/?a=b&c=d');
 * // obj = {path:'/xxx/',params:{a:'b',c:'d'}}
 */
let G_ParseUri = path => {
    //把形如 /xxx/?a=b&c=d 转换成对象 {path:'/xxx/',params:{a:'b',c:'d'}}
    //1. /xxx/a.b.c.html?a=b&c=d  path /xxx/a.b.c.html
    //2. /xxx/?a=b&c=d  path /xxx/
    //3. /xxx/#?a=b => path /xxx/
    //4. /xxx/index.html# => path /xxx/index.html
    //5. /xxx/index.html  => path /xxx/index.html
    //6. /xxx/#           => path /xxx/
    //7. a=b&c=d          => path ''
    //8. /s?src=b#        => path /s params:{src:'b'}
    //9. a=YT3O0sPH1No=   => path '' params:{a:'YT3O0sPH1No='}
    //10.a=YT3O0sPH1No===&b=c => path '' params:{a:'YT3O0sPH1No===',b:'c'}
    //11. ab?a&b          => path ab  params:{a:'',b:''}
    //12. a=b&c           => path '' params:{a:'b',c:''}
    //13. =abc            => path '=abc'
    //14. ab=             => path '' params:{ab:''}
    //15. a&b             => path '' params:{a:'',b:''}
    let r = Magix_PathToObjCache.get(path),
        pathname;
    if (!r) {
        Magix_ParamsObjectTemp = {};
        pathname = path.replace(Magix_PathTrimParamsReg, G_EMPTY);
        if (path == pathname && Magix_IsParam.test(pathname)) pathname = G_EMPTY; //考虑 YT3O0sPH1No= base64后的pathname
        path.replace(pathname, G_EMPTY).replace(Magix_ParamsReg, Magix_ParamsFn);
        Magix_PathToObjCache.set(path, r = {
            a: pathname,
            b: Magix_ParamsObjectTemp
        });
    }
    return {
        path: r.a,
        params: { ...r.b }
    };
};

/**
 * 转换成字符串路径
 * @param  {String} path 路径
 * @param {Object} params 参数对象
 * @param {Object} [keo] 保留空白值的对象
 * @return {String} 字符串路径
 * @example
 * let str = Magix.toUri('/xxx/',{a:'b',c:'d'});
 * // str == /xxx/?a=b&c=d
 *
 * let str = Magix.toUri('/xxx/',{a:'',c:2});
 *
 * // str == /xxx/?a=&c=2
 *
 * let str = Magix.toUri('/xxx/',{a:'',c:2},{c:1});
 *
 * // str == /xxx/?c=2
 * let str = Magix.toUri('/xxx/',{a:'',c:2},{a:1,c:1});
 *
 * // str == /xxx/?a=&c=2
 */
let G_ToUri = (path, params, keo) => {
    let arr = [], v, p, f;
    for (p in params) {
        v = params[p] + G_EMPTY;
        if (!keo || v || G_Has(keo, p)) {
            v = encodeURIComponent(v);
            arr.push(f = p + '=' + v);
        }
    }
    if (f) {
        path += (path && (~path.indexOf('?') ? '&' : '?')) + arr.join('&');
    }
    return path;
};
let G_ToMap = (list, key) => {
    let e, map = {},
        l;
    if (list) {
        for (e of list) {
            map[(key && e) ? e[key] : e] = key ? e : (map[e] | 0) + 1; //对于简单数组，采用累加的方式，以方便知道有多少个相同的元素
        }
    }
    return map;
};

let G_ParseCache = new G_Cache();
let G_ParseExpr = (expr, data, result) => {
    if (G_ParseCache.has(expr)) {
        result = G_ParseCache.get(expr);
    } else {
        //jshint evil:true
        result = G_ToTry(Function(`return ${expr}`));
        if (expr.indexOf(G_SPLITER) > -1) {
            G_TranslateData(data, result);
        } else {
            G_ParseCache.set(expr, result);
        }
    }
    if (DEBUG) {
        result = Safeguard(result);
    }
    return result;
};
/**
 * Magix对象，提供常用方法
 * @name Magix
 * @namespace
 */
let Magix = {
    /**
     * @lends Magix
     */
    /**
     * 设置或获取配置信息
     * @param  {Object} cfg 初始化配置参数对象
     * @param {String} cfg.defaultView 默认加载的view
     * @param {String} cfg.defaultPath 当无法从地址栏取到path时的默认值。比如使用hash保存路由信息，而初始进入时并没有hash,此时defaultPath会起作用
     * @param {Object} cfg.routes path与view映射关系表
     * @param {String} cfg.unmatchView 在routes里找不到匹配时使用的view，比如显示404
     * @param {String} cfg.rootId 根view的id
     * @param {Array} cfg.exts 需要加载的扩展
     * @param {Function} cfg.error 发布版以try catch执行一些用户重写的核心流程，当出错时，允许开发者通过该配置项进行捕获。注意：您不应该在该方法内再次抛出任何错误！
     * @example
     * Magix.config({
     *      rootId:'J_app_main',
     *      defaultView:'app/views/layouts/default',//默认加载的view
     *      defaultPath:'/home',
     *      routes:{
     *          "/home":"app/views/layouts/default"
     *      }
     * });
     *
     *
     * let config = Magix.config();
     *
     * console.log(config.rootId);
     *
     * // 可以多次调用该方法，除内置的配置项外，您也可以缓存一些数据，如
     * Magix.config({
     *     user:'彳刂'
     * });
     *
     * console.log(Magix.config('user'));
     */
    config(cfg, r) {
        r = Magix_Cfg;
        if (cfg) {
            if (G_IsObject(cfg)) {
                r = G_Assign(r, cfg);
            } else {
                r = r[cfg];
            }
        }
        return r;
    },

    /**
     * 应用初始化入口
     * @function
     * @param {Object} [cfg] 配置信息对象,更多信息请参考Magix.config方法
     * @return {Object} 配置信息对象
     * @example
     * Magix.boot({
     *      rootId:'J_app_main'
     * });
     *
     */
    
    boot(cfg) {
        G_Assign(Magix_Cfg, cfg);
        G_Require(Magix_Cfg.exts, () => {
            Vframe_Root().mountView(Magix_Cfg.defaultView);
            
        });
    },
    
    
    /**
     * 把列表转化成hash对象
     * @param  {Array} list 源数组
     * @param  {String} [key]  以数组中对象的哪个key的value做为hash的key
     * @return {Object}
     * @example
     * let map = Magix.toMap([1,2,3,5,6]);
     * //=> {1:1,2:1,3:1,4:1,5:1,6:1}
     *
     * let map = Magix.toMap([{id:20},{id:30},{id:40}],'id');
     * //=>{20:{id:20},30:{id:30},40:{id:40}}
     *
     * console.log(map['30']);//=> {id:30}
     * //转成对象后不需要每次都遍历数组查询
     */
    toMap: G_ToMap,
    
    /**
     * 以try cache方式执行方法，忽略掉任何异常
     * @function
     * @param  {Array} fns     函数数组
     * @param  {Array} [args]    参数数组
     * @param  {Object} [context] 在待执行的方法内部，this的指向
     * @return {Object} 返回执行的最后一个方法的返回值
     * @example
     * let result = Magix.toTry(function(){
     *     return true
     * });
     *
     * // result == true
     *
     * let result = Magix.toTry(function(){
     *     throw new Error('test');
     * });
     *
     * // result == undefined
     *
     * let result = Magix.toTry([function(){
     *     throw new Error('test');
     * },function(){
     *     return true;
     * }]);
     *
     * // result == true
     *
     * //异常的方法执行时，可以通过Magix.config中的error来捕获，如
     *
     * Magix.config({
     *     error:function(e){
     *         console.log(e);//在这里可以进行错误上报
     *     }
     * });
     *
     * let result = Magix.toTry(function(a1,a2){
     *     return a1 + a2;
     * },[1,2]);
     *
     * // result == 3
     * let o={
     *     title:'test'
     * };
     * let result = Magix.toTry(function(){
     *     return this.title;
     * },null,o);
     *
     * // result == 'test'
     */
    toTry: G_ToTry,
    
    /**
     * 转换成字符串路径
     * @function
     * @param  {String} path 路径
     * @param {Object} params 参数对象
     * @param {Object} [keo] 保留空白值的对象
     * @return {String} 字符串路径
     * @example
     * let str = Magix.toUrl('/xxx/',{a:'b',c:'d'});
     * // str == /xxx/?a=b&c=d
     *
     * let str = Magix.toUrl('/xxx/',{a:'',c:2});
     *
     * // str==/xxx/?a=&c=2
     *
     * let str = Magix.toUrl('/xxx/',{a:'',c:2},{c:1});
     *
     * // str == /xxx/?c=2
     * let str = Magix.toUrl('/xxx/',{a:'',c:2},{a:1,c:1});
     *
     * // str == /xxx/?a=&c=2
     */
    toUrl: G_ToUri,
    
    /**
     * 把路径字符串转换成对象
     * @function
     * @param  {String} path 路径字符串
     * @return {Object} 解析后的对象
     * @example
     * let obj = Magix.parseUrl('/xxx/?a=b&c=d');
     * // obj = {path:'/xxx/',params:{a:'b',c:'d'}}
     */
    parseUrl: G_ParseUri,
    /*
     * 路径
     * @function
     * @param  {String} url  参考地址
     * @param  {String} part 相对参考地址的片断
     * @return {String}
     * @example
     * http://www.a.com/a/b.html?a=b#!/home?e=f   /   => http://www.a.com/
     * http://www.a.com/a/b.html?a=b#!/home?e=f   ./     =>http://www.a.com/a/
     * http://www.a.com/a/b.html?a=b#!/home?e=f   ../../    => http://www.a.com/
     * http://www.a.com/a/b.html?a=b#!/home?e=f   ./../  => http://www.a.com/
     */
    //path: G_Path,
    /**
     * 把src对象的值混入到aim对象上
     * @function
     * @param  {Object} aim    要mix的目标对象
     * @param  {Object} src    mix的来源对象
     * @example
     * let o1={
     *     a:10
     * };
     * let o2={
     *     b:20,
     *     c:30
     * };
     *
     * Magix.mix(o1,o2);//{a:10,b:20,c:30}
     *
     *
     * @return {Object}
     */
    mix: G_Assign,
    /**
     * 检测某个对象是否拥有某个属性
     * @function
     * @param  {Object}  owner 检测对象
     * @param  {String}  prop  属性
     * @example
     * let obj={
     *     key1:undefined,
     *     key2:0
     * }
     *
     * Magix.has(obj,'key1');//true
     * Magix.has(obj,'key2');//true
     * Magix.has(obj,'key3');//false
     *
     *
     * @return {Boolean} 是否拥有prop属性
     */
    has: G_Has,
    
    /**
     * 获取对象的keys
     * @param {Object} object 获取key的对象
     * @type {Array}
     * @beta
     * @module linkage|router
     * @example
     * let o = {
     *     a:1,
     *     b:2,
     *     test:3
     * };
     * let keys = Magix.keys(o);
     *
     * // keys == ['a','b','test']
     * @return {Array}
     */
    keys: G_Keys,
    
    /**
     * 判断一个节点是否在另外一个节点内，如果比较的2个节点是同一个节点，也返回true
     * @function
     * @param {String|HTMLElement} node节点或节点id
     * @param {String|HTMLElement} container 容器
     * @example
     * let root = $('html');
     * let body = $('body');
     *
     * let r = Magix.inside(body[0],root[0]);
     *
     * // r == true
     *
     * let r = Magix.inside(root[0],body[0]);
     *
     * // r == false
     *
     * let r = Magix.inside(root[0],root[0]);
     *
     * // r == true
     *
     * @return {Boolean}
     */
    inside: G_NodeIn,
    /**
     * document.getElementById的简写
     * @param {String} id
     * @return {HTMLElement|Null}
     * @example
     * // html
     * // <div id="root"></div>
     *
     * let node = Magix.node('root');
     *
     * // node => div[id='root']
     *
     * // node是document.getElementById的简写
     */
    node: G_GetById,
    
    /**
     * 应用样式
     * @beta
     * @module style
     * @param {String} prefix 样式的名称前缀
     * @param {String} css 样式字符串
     * @example
     * // 该方法配合magix-combine工具使用
     * // 更多信息可参考magix-combine工具：https://github.com/thx/magix-combine
     * // 样式问题可查阅这里：https://github.com/thx/magix-combine/issues/6
     *
     */
    applyStyle: View_ApplyStyle,
    
    /**
     * 返回全局唯一ID
     * @function
     * @param {String} [prefix] 前缀
     * @return {String}
     * @example
     *
     * let id = Magix.guid('mx-');
     * // id maybe mx-7
     */
    
    guid: G_Id,
    Cache: G_Cache,
    use: G_Require,
    dispatch(elem,type,data){
        G_Trigger(G_GetById(elem),type,data);
    },
    match: G_TargetMatchSelector,
    type: G_Type,
    nodeId: IdIt,
    guard: Safeguard
    
};
    
/**
 * 多播事件对象
 * @name Event
 * @namespace
 */
let MEvent = {
    /**
     * @lends MEvent
     */
    /**
     * 触发事件
     * @param {String} name 事件名称
     * @param {Object} data 事件对象
     * @param {Boolean} [remove] 事件触发完成后是否移除这个事件的所有监听
     * @param {Boolean} [lastToFirst] 是否从后向前触发事件的监听列表
     */
    fire(name, data, remove, lastToFirst) {
        let key = G_SPLITER + name,
            me = this,
            list = me[key],
            end, len, idx, t;
        if (!data) data = {};
        data.type = name;
        if (list) {
            end = list.length;
            len = end - 1;
            while (end--) {
                idx = lastToFirst ? end : len - end;
                t = list[idx];
                if (t.f) {
                    t.x = 1;
                    G_ToTry(t.f, data, me);
                    t.x = G_EMPTY;
                } else if (!t.x) {
                    list.splice(idx, 1);
                    len--;
                }
            }
        }
        list = me[`on${name}`];
        if (list) G_ToTry(list, data, me);
        if (remove) me.off(name);
        return me;
    },
    /**
     * 绑定事件
     * @param {String} name 事件名称
     * @param {Function} fn 事件处理函数
     * @example
     * let T = Magix.mix({},Magix.Event);
     * T.on('done',function(e){
     *     alert(1);
     * });
     * T.on('done',function(e){
     *     alert(2);
     *     T.off('done',arguments.callee);
     * });

     * T.fire('done',{data:'test'});
     * T.fire('done',{data:'test2'});
     */
    on(name, f) {
        let me = this;
        let key = G_SPLITER + name;
        let list = me[key] || (me[key] = []);
        list.push({
            f
        });
        return me;
    },
    /**
     * 解除事件绑定
     * @param {String} name 事件名称
     * @param {Function} [fn] 事件处理函数
     */
    off(name, fn) {
        let key = G_SPLITER + name,
            me = this,
            list = me[key],
            t;
        if (fn) {
            if (list) {
                for (t of list) {
                    if (t.f == fn) {
                        t.f = G_EMPTY;
                        break;
                    }
                }
            }
        } else {
            delete me[key];
            delete me[`on${name}`];
        }
        return me;
    }
};
Magix.Event = MEvent;

    
    let State_AppData = {};

/**
 * 可观察的内存数据对象
 * @name State
 * @namespace
 * @borrows Event.on as on
 * @borrows Event.fire as fire
 * @borrows Event.off as off
 * @beta
 * @module router
 */
let State = {
    /**
     * @lends State
     */
    /**
     * 从Magix.State中获取数据
     * @param {String} [key] 数据key
     * @return {Object}
     */
    get(key) {
        let r = key ? State_AppData[key] : State_AppData;
        if (DEBUG) {
            
            r = Safeguard(r, dataKey => {
                
            }, (path, value) => {
            });
        }
        return r;
    },
    /**
     * 设置数据
     * @param {Object} data 数据对象
     */
    set(data, unchanged) {
        
        G_Assign(State_AppData, data);
        
        return this;
    },
    ...MEvent
    
    /**
     * 当State中的数据有改变化后触发
     * @name State.changed
     * @event
     * @param {Object} e 事件对象
     * @param {Object} e.keys  包含哪些数据变化的key集合
     */
};
Magix.State = State;
    
    
    
    let Vframe_RootVframe;
let Vframe_GlobalAlter;
let Vframe_Vframes = {};
let Vframe_NotifyCreated = vframe => {
    if (!vframe['$a'] && !vframe['$b'] && vframe['$cc'] == vframe['$rc']) { //childrenCount === readyCount
        if (!vframe['$cr']) { //childrenCreated
            vframe['$cr'] = 1; //childrenCreated
            vframe['$ca'] = 0; //childrenAlter
            
            vframe.fire('created'); //不在view上派发事件，如果view需要绑定，则绑定到owner上，view一般不用该事件，如果需要这样处理：this.owner.oncreated=function(){};this.ondestroy=function(){this.owner.off('created')}
            
        }
        let { id, pId } = vframe, p = Vframe_Vframes[pId];
        if (p && !G_Has(p['$d'], id)) { //readyChildren
            p['$d'][id] = 1; //readyChildren
            p['$rc']++; //readyCount
            Vframe_NotifyCreated(p);
        }
    }
};
let Vframe_NotifyAlter = (vframe, e) => {
    if (!vframe['$ca'] && vframe['$cr']) { //childrenAlter childrenCreated 当前vframe触发过created才可以触发alter事件
        vframe['$cr'] = 0; //childrenCreated
        vframe['$ca'] = 1; //childreAleter
        
        vframe.fire('alter', e);
        
        let { id, pId } = vframe, p = Vframe_Vframes[pId];
        //let vom = vframe.owner;
        if (p && G_Has(p['$d'], id)) { //readyMap
            p['$rc']--; //readyCount
            delete p['$d'][id]; //readyMap
            Vframe_NotifyAlter(p, e);
        }
    }
};
let Vframe_TranslateQuery = (pId, src, params, pVf) => {
    pVf = Vframe_Vframes[pId];
    pVf = pVf && pVf['$v'];
    pVf = pVf ? pVf['$a'] : {};
    if (src.indexOf(G_SPLITER) > 0) {
        G_TranslateData(pVf, params);
    }
};
/**
 * 获取根vframe;
 * @return {Vframe}
 * @private
 */
let Vframe_Root = (rootId, e) => {
    if (!Vframe_RootVframe) {
        /*
            尽可能的延迟配置，防止被依赖时，配置信息不正确
        */
        G_DOCBODY = G_DOCUMENT.body;

        rootId = Magix_Cfg.rootId;
        e = G_GetById(rootId);
        if (!e) {
            G_DOCBODY.id = rootId;
        }
        Vframe_RootVframe = new Vframe(rootId);
    }
    return Vframe_RootVframe;
};


let Vframe_AddVframe = (id, vframe) => {
    if (!G_Has(Vframe_Vframes, id)) {
        Vframe_Vframes[id] = vframe;
        
        Vframe.fire('add', {
            vframe
        });
        
        
    }
};

let Vframe_RunInvokes = (vf, list, o) => {
    list = vf['$e']; //invokeList
    while (list.length) {
        o = list.shift();
        if (!o.r) { //remove
            vf.invoke(o.n, o.a); //name,arguments
        }
        delete list[o.k]; //key
    }
};

let Vframe_Cache = [];
let Vframe_RemoveVframe = (id, fcc, vframe) => {
    vframe = Vframe_Vframes[id];
    if (vframe) {
        delete Vframe_Vframes[id];
        
        Vframe.fire('remove', {
            vframe,
            fcc //fireChildrenCreated
        });
        
        if (DEBUG) {
            let nodes = G_DOCUMENT.querySelectorAll('#' + id);
            if (nodes.length > 1) {
                Magix_Cfg.error(Error(`remove vframe error. dom id:"${id}" duplicate`));
            }
        }
        id = G_GetById(id);
        if (id) {
            id['$a'] = 0;
            
            
        }
    }
};
/**
 * Vframe类
 * @name Vframe
 * @class
 * @constructor
 * @borrows Event.on as on
 * @borrows Event.fire as fire
 * @borrows Event.off as off
 * @borrows Event.on as #on
 * @borrows Event.fire as #fire
 * @borrows Event.off as #off
 * @param {String} id vframe id
 * @property {String} id vframe id
 * @property {String} path 当前view的路径名，包括参数
 * @property {String} pId 父vframe的id，如果是根节点则为undefined
 */
function Vframe(id, pId, me) {
    me = this;
    me.id = id;
    if (DEBUG) {
        let bad = 0;
        if (!pId && id != Magix_Cfg.rootId) {
            bad = 1;
        }
        if (!bad && id && pId) {
            let parent = Vframe_Vframes[pId];
            if (!parent || !parent['$c'][id]) {
                bad = 1;
            }
        }
        if (bad) {
            console.error('beware! Avoid use new Magix.Vframe() outside');
        }
    }
    //me.vId=id+'_v';
    me['$c'] = {}; //childrenMap
    me['$cc'] = 0; //childrenCount
    me['$rc'] = 0; //readyCount
    me['$f'] = me['$f'] || 1; //signature
    me['$d'] = {}; //readyMap
    
    me['$e'] = []; //invokeList
    
    
    me.pId = pId;
    Vframe_AddVframe(id, me);
}

G_Assign(Vframe, {
    /**
     * @lends Vframe
     */
    /**
     * 获取所有的vframe对象
     * @return {Object}
     */
    all() {
        return Vframe_Vframes;
    },
    /**
     * 根据vframe的id获取vframe对象
     * @param {String} id vframe的id
     * @return {Vframe|undefined} vframe对象
     */
    get(id) {
        return Vframe_Vframes[id];
    }
    /**
     * 注册vframe对象时触发
     * @name Vframe.add
     * @event
     * @param {Object} e
     * @param {Vframe} e.vframe
     */
    /**
     * 删除vframe对象时触发
     * @name Vframe.remove
     * @event
     * @param {Object} e
     * @param {Vframe} e.vframe
     * @param {Boolean} e.fcc 是否派发过created事件
     */
}, MEvent);

G_Assign(Vframe[G_PROTOTYPE], MEvent, {
    /**
     * @lends Vframe#
     */
    /**
     * 加载对应的view
     * @param {String} viewPath 形如:app/views/home?type=1&page=2 这样的view路径
     * @param {Object|Null} [viewInitParams] 调用view的init方法时传递的参数
     */
    mountView(viewPath, viewInitParams /*,keepPreHTML*/) {
        let me = this;
        let id = me.id;
        let node = G_GetById(id),
            pId = me.pId, po, sign, view, params , ctors ;
        if (!me['$g'] && node) { //alter
            me['$g'] = 1;
            me['$h'] = node.innerHTML; //.replace(ScriptsReg, ''); template
        }
        me.unmountView(/*keepPreHTML*/);
        me['$a'] = 0; //destroyed 详见unmountView
        po = G_ParseUri(viewPath || G_EMPTY);
        view = po[G_PATH];
        if (node && view) {
            me[G_PATH] = viewPath;
            params = po[G_PARAMS];
            Vframe_TranslateQuery(pId, viewPath, params);
            me['$i'] = po[G_PATH];
            G_Assign(params, viewInitParams);
            sign = me['$f'];
            G_Require(view, TView => {
                if (sign == me['$f']) { //有可能在view载入后，vframe已经卸载了
                    if (!TView) {
                        return Magix_Cfg.error(Error(`id:${id} cannot load:${view}`));
                    }
                    
                    ctors = View_Prepare(TView);
                    
                    view = new TView(id, me, params, ctors );

                    if (DEBUG) {
                        let viewProto = TView.prototype;
                        let importantProps = {
                            id: 1,
                            updater: 1,
                            owner: 1,
                            '$l': 1,
                            '$r': 1,
                            '$b': 1,
                            '$d': 1,
                            '$a': 1,
                            '$e': 1
                        };
                        for (let p in view) {
                            if (G_Has(view, p) && viewProto[p]) {
                                throw new Error(`avoid write ${p} at file ${viewPath}!`);
                            }
                        }
                        view = Safeguard(view, null, (key, value) => {
                            if (G_Has(viewProto, key) ||
                                (G_Has(importantProps, key) &&
                                    (key != '$b' || !isFinite(value)) &&
                                    (key != 'owner' || value !== 0))) {
                                throw new Error(`avoid write ${key} at file ${viewPath}!`);
                            }
                        }, true);
                    }
                    me['$v'] = view;
                    
                    View_DelegateEvents(view);
                    
                     G_ToTry(view.init, params, view);
                    
                    
                            view['$f']();
                            if (!view.tmpl) { //无模板
                                me['$g'] = 0; //不会修改节点，因此销毁时不还原
                                if (!view['$g']) {
                                    view.endUpdate();
                                }
                            }
                            
                }
            });
        }
    },
    /**
     * 销毁对应的view
     */
    unmountView( /*keepPreHTML*/) {
        let me = this;
        let { '$v': v, id } = me,
            node, reset;
        
        me['$e'] = []; //invokeList 销毁当前view时，连同调用列表一起销毁
        
        if (v) {
            if (!Vframe_GlobalAlter) {
                reset = 1;
                Vframe_GlobalAlter = {
                    id
                };
            }
            me['$a'] = 1; //用于标记当前vframe处于$v销毁状态，在当前vframe上再调用unmountZone时不派发created事件
            me.unmountZone(0, 1);
            Vframe_NotifyAlter(me, Vframe_GlobalAlter);

            me['$v'] = 0; //unmountView时，尽可能早的删除vframe上的$v对象，防止$v销毁时，再调用该 vfrmae的类似unmountZone方法引起的多次created
            if (v['$b'] > 0) {
                v['$b'] = 0;
                delete Body_RangeEvents[id];
                delete Body_RangeVframes[id];
                
                
                v.fire('destroy', 0, 1, 1);
                
                
                View_DestroyAllResources(v, 1);
                
                View_DelegateEvents(v, 1);
                v.owner = 0;
            }
            v['$b']--;
            node = G_GetById(id);
            if (node && me['$g'] /*&&!keepPreHTML*/) { //如果$v本身是没有模板的，也需要把节点恢复到之前的状态上：只有保留模板且$v有模板的情况下，这条if才不执行，否则均需要恢复节点的html，即$v安装前什么样，销毁后把节点恢复到安装前的情况
                node.innerHTML = me['$h'];
            }
            if (reset)
                Vframe_GlobalAlter = 0;
        }
        me['$f']++; //增加signature，阻止相应的回调，见mountView
    },
    /**
     * 加载vframe
     * @param  {String} id             节点id
     * @param  {String} viewPath       view路径
     * @param  {Object} [viewInitParams] 传递给view init方法的参数
     * @return {Vframe} vframe对象
     * @example
     * // html
     * // &lt;div id="magix_vf_defer"&gt;&lt;/div&gt;
     *
     *
     * //js
     * view.owner.mountVframe('magix_vf_defer','app/views/list',{page:2})
     * //注意：动态向某个节点渲染view时，该节点无须是vframe标签
     */
    mountVframe(vfId, viewPath, viewInitParams /*, keepPreHTML*/) {
        let me = this,
            vf, id = me.id, c = me['$c'];
        Vframe_NotifyAlter(me, {
            id: vfId
        }); //如果在就绪的vframe上渲染新的vframe，则通知有变化
        //let vom = me.owner;
        vf = Vframe_Vframes[vfId];
        if (!vf) {
            if (!G_Has(c, vfId)) { //childrenMap,当前子vframe不包含这个id
                
                me['$j'] = 0; //childrenList 清空缓存的子列表
                
                me['$cc']++; //childrenCount ，增加子节点
            }
            c[vfId] = vfId; //map
            //
            vf = Vframe_Cache.pop();
            if (vf) {
                Vframe.call(vf, vfId, id);
            } else {
                vf = new Vframe(vfId, id);
            }
            //vf = Vframe_GetVf(id, me.id);// new Vframe(id, me.id);
        }
        vf.mountView(viewPath, viewInitParams /*,keepPreHTML*/);
        return vf;
    },
    /**
     * 加载某个区域下的view
     * @param {HTMLElement|String} zoneId 节点对象或id
     * @example
     * // html
     * // &lt;div id="zone"&gt;
     * //   &lt;div mx-view="path/to/v1"&gt;&lt;/div&gt;
     * // &lt;/div&gt;
     *
     * view.onwer.mountZone('zone');//即可完成zone节点下的view渲染
     */
    mountZone(zoneId, inner /*,keepPreHTML*/) {
        let me = this;
        let vf, id, vfs = [];
        zoneId = zoneId || me.id;

        let vframes = $(`${G_HashKey}${zoneId} [${G_MX_VIEW}]`);
        /*
            body(#mx-root)
                div(mx-vframe=true,mx-view='xx')
                    div(mx-vframe=true,mx-view=yy)
            这种结构，自动构建父子关系，
            根结点渲染，获取到子列表[div(mx-view=xx)]
                子列表渲染，获取子子列表的子列表
                    加入到忽略标识里
            会导致过多的dom查询

            现在使用的这种，无法处理这样的情况，考虑到项目中几乎没出现过这种情况，先采用高效的写法
            上述情况一般出现在展现型页面，dom结构已经存在，只是附加上js行为
            不过就展现来讲，一般是不会出现嵌套的情况，出现的话，把里面有层级的vframe都挂到body上也未尝不可，比如brix2.0
         */

        me['$b'] = 1; //hold fire creted
        //me.unmountZone(zoneId, 1); 不去清理，详情见：https://github.com/thx/magix/issues/27
        
        for (vf of vframes) {
            if (!vf['$a']) { //防止嵌套的情况下深层的view被反复实例化
                id = IdIt(vf);
                vf['$a'] = 1;
                vfs.push([id, G_GetAttribute(vf, G_MX_VIEW)]);
            }
        }
        for ([id, vf] of vfs) {
            if (DEBUG && document.querySelectorAll(`#${id}`).length > 1) {
                Magix_Cfg.error(Error(`mount vframe error. dom id:"${id}" duplicate`));
            }
            if (DEBUG) {
                if (vfs[id]) {
                    Magix_Cfg.error(Error(`vf.id duplicate:${id} at ${me[G_PATH]}`));
                } else {
                    me.mountVframe(vfs[id] = id, vf);
                }
            } else {
                me.mountVframe(id, vf);
            }
        }
        me['$b'] = 0;
        if (!inner) {
            Vframe_NotifyCreated(me);
        }
    },
    /**
     * 销毁vframe
     * @param  {String} [id]      节点id
     */
    unmountVframe(id /*,keepPreHTML*/, inner) { //inner 标识是否是由内部调用，外部不应该传递该参数
        let me = this,
            vf;
        id = id ? me['$c'][id] : me.id;
        //let vom = me.owner;
        vf = Vframe_Vframes[id];
        if (vf) {
            let { '$cr': cr, pId } = vf;
            vf.unmountView(/*keepPreHTML*/);
            Vframe_RemoveVframe(id, cr);
            vf.id = vf.pId = vf['$c'] = vf['$d'] = 0; //清除引用,防止被移除的view内部通过setTimeout之类的异步操作有关的界面，影响真正渲染的view
            
            vf['$g'] = 0;
            
            vf.off('alter');
            vf.off('created');
            //if (Vframe_Cache.length < 10) {
            Vframe_Cache.push(vf);
            //}
            vf = Vframe_Vframes[pId];
            if (vf && G_Has(vf['$c'], id)) { //childrenMap
                delete vf['$c'][id]; //childrenMap
                
                vf['$j'] = 0;
                
                vf['$cc']--; //cildrenCount
                if (!inner) Vframe_NotifyCreated(vf); //移除后通知完成事件
            }
        }
    },
    /**
     * 销毁某个区域下面的所有子vframes
     * @param {HTMLElement|String} [zoneId] 节点对象或id
     */
    unmountZone(zoneId, inner) {
        let me = this;
        let p;
        for (p in me['$c']) {
            if (!zoneId || (p != zoneId && G_NodeIn(p, zoneId))) {
                me.unmountVframe(p /*,keepPreHTML,*/, 1);
            }
        }
        if (!inner) Vframe_NotifyCreated(me);
    } ,
    /**
     * 获取父vframe
     * @param  {Integer} [level] 向上查找层级，默认1,取当前vframe的父级
     * @return {Vframe|undefined}
     * @beta
     * @module linkage
     */
    parent(level, vf) {
        vf = this;
        level = (level >>> 0) || 1;
        while (vf && level--) {
            vf = Vframe_Vframes[vf.pId];
        }
        return vf;
    },
    /**
     * 获取当前vframe的所有子vframe的id。返回数组中，vframe在数组中的位置并不固定
     * @return {Array[String]}
     * @beta
     * @module linkage
     * @example
     * let children = view.owner.children();
     * console.log(children);
     */
    children(me) {
        me = this;
        return me['$j'] || (me['$j'] = G_Keys(me['$c']));
    },
    /**
     * 调用view的方法
     * @param  {String} name 方法名
     * @param  {Array} [args] 参数
     * @return {Object}
     * @beta
     * @module linkage
     * @example
     * // html
     * // &lt;div&gt; mx-view="path/to/v1" id="test"&gt;&lt;/div&gt;
     * let vf = Magix.Vframe.get('test');
     * vf.invoke('methodName',['args1','agrs2']);
     */
    invoke(name, args) {
        let result;
        let vf = this,
            view, fn, o, list = vf['$e'],
            key;
        if ((view = vf['$v']) && view['$g']) { //view rendered
            result = (fn = view[name]) && G_ToTry(fn, args, view);
        } else {
            o = list[key = G_SPLITER + name];
            if (o) {
                o.r = args === o.a; //参数一样，则忽略上次的
            }
            o = {
                n: name,
                a: args,
                k: key
            };
            list.push(o);
            list[key] = o;
        }
        return result;
    }


    


    /**
     * 子孙view修改时触发
     * @name Vframe#alter
     * @event
     * @param {Object} e
     */

    /**
     * 子孙view创建完成时触发
     * @name Vframe#created
     * @event
     * @param {Object} e
     */
});
Magix.Vframe = Vframe;


/**
 * Vframe 中的2条线
 * 一：
 *     渲染
 *     每个Vframe有$cc(childrenCount)属性和$c(childrenItems)属性
 *
 * 二：
 *     修改与创建完成
 *     每个Vframe有rC(readyCount)属性和$r(readyMap)属性
 *
 *      fca firstChildrenAlter  fcc firstChildrenCreated
 */
    /*
    dom event处理思路

    性能和低资源占用高于一切，在不特别影响编程体验的情况下，向性能和资源妥协

    1.所有事件代理到body上
    2.优先使用原生冒泡事件，使用mouseover+Magix.inside代替mouseenter
        'over<mouseover>':function(e){
            if(!Magix.inside(e.relatedTarget,e.eventTarget)){
                //enter
            }
        }
    3.事件支持嵌套，向上冒泡
    4.如果同一节点上同时绑定了mx-event和选择器事件，如
        <div data-menu="true" mx-click="clickMenu()"></div>

        'clickMenu<click>'(e){
            console.log('direct',e);
        },
        '$div[data-menu="true"]<click>'(e){
            console.log('selector',e);
        }

        那么先派发选择器绑定的事件再派发mx-event绑定的事件


    5.在当前view根节点上绑定事件，目前只能使用选择器绑定，如
        '$<click>'(e){
            console.log('view root click',e);
        }
    
    range:{
        app:{
            20:{
                mouseover:1,
                mousemove:1
            }
        }
    }
    view:{
        linkage:{
            40:1
        }
    }
 */
let Body_EvtInfoCache = new G_Cache(30, 10);
let Body_EvtInfoReg = /(?:([\w\-]+)\x1e)?([^(]+)\(([\s\S]*)?\)/;
let Body_RootEvents = {};
let Body_SearchSelectorEvents = {};
let Body_RangeEvents = {};
let Body_RangeVframes = {};
let Body_Guid = 0;
let Body_FindVframeInfo = (current, eventType) => {
    let vf, tempId, selectorObject, eventSelector, eventInfos = [],
        begin = current,
        info = G_GetAttribute(current, `mx-${eventType}`),
        match, view, vfs = [],
        selectorVfId = G_HashKey,
        backtrace = 0;
    if (info) {
        match = Body_EvtInfoCache.get(info);
        if (!match) {
            match = info.match(Body_EvtInfoReg) || G_EMPTY_ARRAY;
            match = {
                v: match[1],
                n: match[2],
                i: match[3]
            };
            Body_EvtInfoCache.set(info, match);
        }
        match = {
            ...match,
            r: info
        };
    }
    //如果有匹配但没有处理的vframe或者事件在要搜索的选择器事件里
    if ((match && !match.v) || Body_SearchSelectorEvents[eventType]) {
        if ((selectorObject = Body_RangeVframes[tempId = begin['$b']])
            && selectorObject[begin['$d']] == 1) {
            view = 1;
            selectorVfId = tempId;//如果节点有缓存，则使用缓存
        }
        if (!view) { //先找最近的vframe
            vfs.push(begin);
            while (begin != G_DOCBODY && (begin = begin.parentNode)) { //找最近的vframe,且节点上没有mx-autonomy属性
                if (Vframe_Vframes[tempId = begin.id] ||
                    ((selectorObject = Body_RangeVframes[tempId = begin['$b']]) &&
                        selectorObject[begin['$d']] == 1)) {
                    selectorVfId = tempId;
                    break;
                }
                vfs.push(begin);
            }
            for (info of vfs) {
                if (!(tempId = Body_RangeVframes[selectorVfId])) {
                    tempId = Body_RangeVframes[selectorVfId] = {};
                }
                selectorObject = info['$d'] || (info['$d'] = ++Body_Guid);
                tempId[selectorObject] = 1;
                info['$b'] = selectorVfId;
            }
        }
        //if (selectorVfId != G_HashKey) { //从最近的vframe向上查找带有选择器事件的view
        //主要兼容服务端输出，不带id的情况
        begin = current.id;
        if (Vframe_Vframes[begin]) {
            /*
                如果当前节点是vframe的根节点，则把当前的vf置为该vframe
                该处主要处理这样的边界情况
                <mx-vrame src="./test" mx-click="parent()"/>
                //.test.js
                export default Magix.View.extend({
                    '$<click>'(){
                        console.log('test clicked');
                    }
                });

                当click事件发生在mx-vframe节点上时，要先派发内部通过选择器绑定在根节点上的事件，然后再派发外部的事件
            */
            backtrace = selectorVfId = begin;
        }
        do {
            vf = Vframe_Vframes[selectorVfId];
            if (vf && (view = vf['$v'])) {
                selectorObject = view['$so'];
                eventSelector = selectorObject[eventType];
                if (eventSelector) {
                    for (begin = eventSelector.length; begin--;) {
                        tempId = eventSelector[begin];
                        selectorObject = {
                            r: tempId,
                            v: selectorVfId,
                            n: tempId
                        };
                        if (tempId) {
                            /*
                                事件发生时，做为临界的根节点只能触发`$`绑定的事件，其它事件不能触发
                            */
                            if (!backtrace &&
                                G_TargetMatchSelector(current, tempId)) {
                                eventInfos.push(selectorObject);
                            }
                        } else if (backtrace) {
                            eventInfos.unshift(selectorObject);
                        }
                    }
                }
                //防止跨view选中，到带模板的view时就中止或未指定
                if (view.tmpl && !backtrace) {
                    break; //带界面的中止
                }
                backtrace = 0;
            }
        }
        while (vf && (selectorVfId = vf.pId));
        //}
    }
    if (match) {
        eventInfos.push(match);
    }
    return eventInfos;
};

let Body_DOMEventProcessor = domEvent => {
    let { target, type } = domEvent;
    let eventInfos;
    let ignore;
    let vframe, view, eventName, fn;
    let lastVfId;
    let params, arr = [];
    while (target != G_DOCBODY) {
        eventInfos = Body_FindVframeInfo(target, type);
        if (eventInfos.length) {
            arr = [];
            for (let { v, r, n, i } of eventInfos) {
                if (!v && DEBUG) {
                    return Magix_Cfg.error(Error(`bad ${type}:${r}`));
                }
                if (lastVfId != v) {
                    if (lastVfId && domEvent.isPropagationStopped()) {
                        break;
                    }
                    lastVfId = v;
                }
                vframe = Vframe_Vframes[v];
                view = vframe && vframe['$v'];
                if (view) {
                    if (view['$g']) {
                        eventName = n + G_SPLITER + type;
                        fn = view[eventName];
                        if (fn) {
                            domEvent.eventTarget = target;
                            params = i ? G_ParseExpr(i, view['$a']) : {};
                            domEvent[G_PARAMS] = params;
                            G_ToTry(fn, domEvent, view);
                            //没发现实际的用途
                            /*if (domEvent.isImmediatePropagationStopped()) {
                                break;
                            }*/
                        }
                        if (DEBUG) {
                            if (!fn) { //检测为什么找不到处理函数
                                if (eventName[0] == '\u001f') {
                                    console.error('use view.wrapEvent wrap your html');
                                } else {
                                    console.error('can not find event processor:' + n + '<' + type + '> from view:' + vframe.path);
                                }
                            }
                        }
                    }
                } else {//如果处于删除中的事件触发，则停止事件的传播
                    domEvent.stopPropagation();
                }
                if (DEBUG) {
                    if (!view && view !== 0) { //销毁
                        console.error('can not find vframe:' + v);
                    }
                }
            }
        }
        /*|| e.mxStop */
        if (((ignore = Body_RangeEvents[fn = target['$b']]) &&
            (ignore = ignore[target['$d']]) &&
            ignore[type]) ||
            domEvent.isPropagationStopped()) { //避免使用停止事件冒泡，比如别处有一个下拉框，弹开，点击到阻止冒泡的元素上，弹出框不隐藏
            //如果从某个节点开始忽略某个事件的处理，则如果缓存中有待处理的节点，把这些节点owner.vframe处理成当前节点的owner.vframe
            if (arr.length) {
                arr.push(fn);
            }
            break;
        } else {
            //如果某个节点是view临界节点
            //先追加id，后续节点的owner.vframe则是该节点
            lastVfId = target.id;
            if (Vframe_Vframes[lastVfId]) {
                arr.push(lastVfId);
            }
            //缓存
            arr.push(target);
        }
        target = target.parentNode || G_DOCBODY;
    }
    if ((fn = arr.length)) {
        ignore = G_HashKey;
        for (; fn--;) {
            view = arr[fn];
            if (view.nodeType) {
                if (!(eventInfos = Body_RangeEvents[ignore])) {
                    eventInfos = Body_RangeEvents[ignore] = {};
                }
                lastVfId = view['$d'] || (view['$d'] = ++Body_Guid);
                if (!(params = eventInfos[lastVfId])) {
                    params = eventInfos[lastVfId] = {};
                    //view['$b'] = ignore;
                }
                params[type] = 1;
            } else {
                ignore = view;
            }
        }
    }
};
let Body_DOMEventBind = (type, searchSelector, remove) => {
    let counter = Body_RootEvents[type] | 0;
    let offset = (remove ? -1 : 1);
    if (!counter || remove === counter) { // remove=1  counter=1
        G_DOMEventLibBind(G_DOCBODY, type, Body_DOMEventProcessor, remove);
    }
    Body_RootEvents[type] = counter + offset;
    if (searchSelector) { //记录需要搜索选择器的事件
        Body_SearchSelectorEvents[type] = (Body_SearchSelectorEvents[type] | 0) + offset;
    }
};
    
    
    
//let Q_VfToVNodes={};
let Q_Create = (tag/*, views*/, children, props, unary) => {
    //html=tag+to_array(attrs)+children.html
    let token;
    if (tag) {
        props = props || {};
        let compareKey = G_EMPTY,
            hasMxv,
            prop, value, c,
            reused = {},
            outerHTML = '<' + tag,
            attrs,
            innerHTML = G_EMPTY,
            newChildren = [],
            prevNode;
        if (children) {
            for (c of children) {
                value = c['a'];
                if (c['b'] == V_TEXT_NODE) {
                    if (!value) {
                        value = ' ';
                    }
                    value = Updater_Encode(value);
                }
                innerHTML += value;
                //merge text node
                if (prevNode &&
                    c['b'] == V_TEXT_NODE &&
                    prevNode['b'] == V_TEXT_NODE) {
                    //prevNode['c'] += c['c'];
                    prevNode['a'] += c['a'];
                } else {
                    //reused node if new node key equal old node key
                    if (c['d']) {
                        reused[c['d']] = (reused[c['d']] || 0) + 1;
                    }
                    //force diff children
                    if (c['e'] ||
                        V_SPECIAL_PROPS[c['b']]) {
                        hasMxv = 1;
                    }
                    prevNode = c;
                    newChildren.push(c);
                }
            }
        }
        for (prop in props) {
            value = props[prop];
            //布尔值
            if (value === false || value == G_NULL) {
                delete props[prop];
                continue;
            } else if (value === true) {
                value = G_EMPTY;
            }
            if (prop == 'id') {//如果有id优先使用
                compareKey = value;
            } else if (prop == G_MX_VIEW && value && !compareKey) {
                //否则如果是组件,则使用组件的路径做为key
                compareKey = G_ParseUri(value)[G_PATH];
            } else if (prop == G_Tag_Key && !compareKey) {
                compareKey = value;
            } else if (prop == G_Tag_View_Key) {
                hasMxv = 1;
            }
            if (prop == 'x-html') {
                innerHTML = value;
                newChildren = [{
                    'b': G_SPLITER,
                    'a': value
                }];
                delete props[prop];
            } else {
                props[prop] = value;
                outerHTML += ` ${prop}="${Updater_Encode(value)}"`;
            }
        }
        attrs = outerHTML;
        if (unary) {
            outerHTML += '/>';
        } else {
            outerHTML += `>${innerHTML}</${tag}>`;
        }
        // if (props[G_MX_VIEW]) {
        //     views.push(newChildren);
        // }
        token = {
            'a': outerHTML,
            'c': innerHTML,
            'd': compareKey,
            'b': tag,
            'e': hasMxv,
            'f': attrs,
            'g': props,
            'h': newChildren,
            'i': reused,
            'j': unary
        };
    } else {
        token = {
            'b': V_TEXT_NODE,
            //'c': children,
            'a': children + G_EMPTY
        };
    }
    return token;
};
    let V_SPECIAL_PROPS = {
    input: [G_VALUE, 'checked'],
    textarea: [G_VALUE],
    option: ['selected']
};

if (DEBUG) {
    var CheckNodes = (realNodes, vNodes) => {
        let index = 0;
        if (vNodes.length != 1 ||
            vNodes[0]['b'] != G_SPLITER) {
            for (let e of realNodes) {
                if (e.nodeName.toLowerCase() != vNodes[index].b) {
                    console.warn('real not match virtual!');
                }
                index++;
            }
        }
    };
}

let V_TEXT_NODE = G_COUNTER;
if (DEBUG) {
    V_TEXT_NODE = '#text';
}
let V_UnmountVframs = (vf, n, id) => {
    if (n.nodeType == 1) {
        id = IdIt(n);
        if (vf['$c'][id]) {
            vf.unmountVframe(id, 1);
        } else {
            vf.unmountZone(id, 1);
        }
    }
};
let V_NSMap = {
    svg: 'http://www.w3.org/2000/svg',
    math: 'http://www.w3.org/1998/Math/MathML'
};
let V_SetAttributes = (oldNode, lastVDOM, newVDOM, ref) => {
    let key, value,
        nMap = newVDOM['g'],
        oMap = lastVDOM['g'];
    if (lastVDOM) {
        for (key in oMap) {
            if (!G_Has(nMap, key)) {//如果旧有新木有
                if (key == 'id') {
                    ref.d.push([oldNode, G_EMPTY]);
                } else {
                    ref.c = 1;
                    oldNode.removeAttribute(key);
                }
            }
        }
    }
    for (key in nMap) {
        value = nMap[key];
        //旧值与新值不相等
        if (!lastVDOM || oMap[key] !== value) {
            if (key == 'id') {
                ref.d.push([oldNode, value]);
            } else {
                ref.c = 1;
                oldNode.setAttribute(key, value);
            }
        }
    }
};

let V_SpecialDiff = (oldNode, lastVDOM, newVDOM) => {
    let tag = lastVDOM['b'], c, now;
    let specials = V_SPECIAL_PROPS[tag];
    let nMap = newVDOM['g'];
    let result = 0;
    if (specials) {
        for (c of specials) {
            now = G_Has(nMap, c) ? c != G_VALUE || nMap[c] : c == G_VALUE && G_EMPTY;
            if (oldNode[c] != now) {
                result = 1;
                oldNode[c] = now;
            }
        }
    }
    return result;
};
let V_CreateNode = (vnode, owner, ref) => {
    let tag = vnode['b'], c;
    if (tag == V_TEXT_NODE) {
        c = G_DOCUMENT.createTextNode(vnode['a']);
    } else {
        c = G_DOCUMENT.createElementNS(V_NSMap[tag] || owner.namespaceURI, tag);
        V_SetAttributes(c, 0, vnode, ref);
        if (vnode['c']) {
            c.innerHTML = vnode['c'];
        }
    }
    return c;
};
let V_SetChildNodes = (realNode, lastVDOM, newVDOM, ref, vframe, keys) => {
    if (lastVDOM) {//view首次初始化，通过innerHTML快速更新
        if (
            lastVDOM['e'] ||
            lastVDOM['c'] != newVDOM['c']) {
            let i, oi = 0,
                oldChildren = lastVDOM['h'],
                newChildren = newVDOM['h'], oc, nc,
                oldCount = oldChildren.length, newCount = newChildren.length,
                reused = newVDOM['i'],
                nodes = realNode.childNodes, compareKey,
                keyedNodes = {},
                realIndex = 0,
                oldVIndex = 0;
            for (i = oldCount; i--;) {
                oc = oldChildren[i];
                compareKey = oc['d'];
                if (compareKey) {
                    compareKey = keyedNodes[compareKey] || (keyedNodes[compareKey] = []);
                    compareKey.push(nodes[i]);
                }
            }
            
            for (i = 0; i < newCount; i++) {
                nc = newChildren[i];
                
                oc = oldChildren[oldVIndex];
                
                compareKey = keyedNodes[nc['d']];
                if (compareKey && (compareKey = compareKey.pop())) {
                    while (compareKey != nodes[realIndex]) {//如果找到的节点和当前不同，则移动
                        realNode.appendChild(nodes[realIndex]);
                        
                        oldChildren.push(oldChildren[oldVIndex]);
                        oldChildren.splice(oldVIndex, 1);
                        oc = oldChildren[oldVIndex];
                        
                        
                    }
                    if (reused[oc['d']]) {
                        reused[oc['d']]--;
                    }
                    
                    V_SetNode(compareKey, realNode, oc, nc, ref, vframe, keys);
                    
                } else if (oc) {//有旧节点，则更新
                    if (keyedNodes[oc['d']] &&
                        reused[oc['d']]) {
                        //oldChildren.splice(i, 0, nc);//插入一个占位符，在接下来的比较中才能一一对应
                        oldCount++;
                        ref.c = 1;
                        
                        realNode.insertBefore(V_CreateNode(nc, realNode, ref), nodes[realIndex]);
                        oldVIndex--;
                        
                    } else {
                        
                        V_SetNode(nodes[realIndex], realNode, oc, nc, ref, vframe, keys);
                        
                        //ref.c = 1;
                    }
                } else {//添加新的节点
                    
                    realNode.appendChild(V_CreateNode(nc, realNode, ref));
                    
                    ref.c = 1;
                }
                
                oldVIndex++;
                
                realIndex++;
            }
            for (i = newCount; i < oldCount; i++) {
                
                oi = nodes[newCount];//删除多余的旧节点
                
                V_UnmountVframs(vframe, oi);
                if (DEBUG) {
                    if (!oi.parentNode) {
                        console.error('Avoid remove node on view.destroy in digesting');
                    }
                }
                
                realNode.removeChild(oi);
                
            }
        }
    } else {
        ref.c = 1;
        realNode.innerHTML = newVDOM['c'];
    }
};
let V_SetNode = (realNode, oldParent, lastVDOM, newVDOM, ref, vframe, keys
                ) => {
    if (DEBUG) {
        if (lastVDOM['b'] != G_SPLITER &&
            newVDOM['b'] != G_SPLITER) {
            if (oldParent.nodeName == 'TEMPLATE') {
                console.error('unsupport template tag');
            }
            if ((realNode.nodeName == '#text' && lastVDOM['b'] != '#text') || (
                realNode.nodeName != '#text' && realNode.nodeName.toLowerCase() != lastVDOM['b'])) {
                console.error('Your code is not match the DOM tree generated by the browser. near:' + lastVDOM['c'] + '. Is that you lost some tags or modified the DOM tree?');
            }
        }
    }
    let lastAMap = lastVDOM['g'],
        newAMap = newVDOM['g'];
    if (
        V_SpecialDiff(realNode, lastVDOM, newVDOM) ||
        lastVDOM['e'] ||
        lastVDOM['a'] != newVDOM['a']) {
        if (lastVDOM['b'] == newVDOM['b']) {
            if (lastVDOM['b'] == V_TEXT_NODE) {
                ref.c = 1;
                realNode.nodeValue = newVDOM['a'];
                
            } else if (lastVDOM['b'] == G_SPLITER) {
                ref.c = 1;
                oldParent.innerHTML = newVDOM['a'];
                
            } else if (!lastAMap[G_Tag_Key] ||
                lastAMap[G_Tag_Key] != newAMap[G_Tag_Key]) {
                let newMxView = newAMap[G_MX_VIEW],
                    newHTML = newVDOM['c'];
                let updateAttribute = lastVDOM['f'] != newVDOM['f'],
                    updateChildren, unmountOld,
                    oldVf = Vframe_Vframes[realNode.id],
                    assign,
                    view,
                    uri = newMxView && G_ParseUri(newMxView),
                    params,
                    htmlChanged,
                    paramsChanged;
                /*
                    如果存在新旧view，则考虑路径一致，避免渲染的问题
                 */

                /*
                    只检测是否有参数控制view而不检测数据是否变化的原因：
                    例：view内有一input接收传递的参数，且该input也能被用户输入
                    var d1='xl';
                    var d2='xl';
                    当传递第一份数据时，input显示值xl，这时候用户修改了input的值且使用第二份数据重新渲染这个view，问input该如何显示？
                */
                if (updateAttribute) {
                    V_SetAttributes(realNode, lastVDOM, newVDOM, ref);
                }
                //旧节点有view,新节点有view,且是同类型的view
                if (newMxView && oldVf &&
                    oldVf['$i'] == uri[G_PATH] &&
                    lastAMap.id == newAMap.id &&//id如果不一样也要销毁，只有id同时存在且相同或同时不存在id才可以
                    (view = oldVf['$v'])) {
                    htmlChanged = newHTML != lastVDOM['c'];
                    paramsChanged = newMxView != oldVf[G_PATH];
                    assign = lastAMap[G_Tag_View_Key];
                    if (!htmlChanged && !paramsChanged && assign) {
                        params = assign.split(G_COMMA);
                        for (assign of params) {
                            if (assign == G_HashKey || G_Has(keys, assign)) {
                                paramsChanged = 1;
                                break;
                            }
                        }
                    }
                    if (paramsChanged || htmlChanged || updateAttribute) {
                        assign = view['$g'] && view['$h'];
                        //如果有assign方法,且有参数或html变化
                        if (assign) {
                            params = uri[G_PARAMS];
                            //处理引用赋值
                            Vframe_TranslateQuery(oldVf.pId, newMxView, params);
                            oldVf[G_PATH] = newMxView;//update ref
                            //如果需要更新，则进行更新的操作
                            uri = {
                                //node: newVDOM,//['h'],
                                //html: newHTML,
                                //mxv: hasMXV,
                                node: realNode,
                                attr: updateAttribute,
                                deep: !view.tmpl,
                                inner: htmlChanged,
                                query: paramsChanged
                            };
                            //updateAttribute = 1;
                            if (G_ToTry(assign, [params, uri], view)) {
                                ref.v.push(view);
                            }
                            //默认当一个组件有assign方法时，由该方法及该view上的render方法完成当前区域内的节点更新
                            //而对于不渲染界面的控制类型的组件来讲，它本身更新后，有可能需要继续由magix更新内部的子节点，此时通过deep参数控制
                            updateChildren = uri.deep;
                        } else {
                            unmountOld = 1;
                            updateChildren = 1;
                        }
                    }// else {
                    // updateAttribute = 1;
                    //}
                } else {
                    updateChildren = 1;
                    unmountOld = oldVf;
                }
                if (unmountOld) {
                    ref.c = 1;
                    oldVf.unmountVframe(0, 1);
                }
                // Update all children (and subchildren).
                //自闭合标签不再检测子节点
                if (updateChildren &&
                    !newVDOM['j']) {
                    //ref.c = 1;
                    V_SetChildNodes(realNode, lastVDOM, newVDOM, ref, vframe, keys
                );
                }
                
            }
        } else {
            if (lastVDOM['b'] == G_SPLITER) {
                oldParent.innerHTML = ' ';//use text node;
                realNode = oldParent.firstChild;
            }
            V_UnmountVframs(vframe, realNode);
            
            if (newVDOM['b'] == G_SPLITER) {
                oldParent.innerHTML = newVDOM['a'];
            } else {
                oldParent.replaceChild(V_CreateNode(newVDOM, oldParent, ref), realNode);
            }
            
            ref.c = 1;
        }
    }
};
    
    let View_EvtMethodReg = /^(\$?)([^<]*)<([^>]+)>(?:&(.+))?$/;

let processMixinsSameEvent = (exist, additional, temp) => {
    if (exist['a']) {
        temp = exist;
    } else {
        temp = function (e) {
            G_ToTry(temp['a'], e, this);
        };
        temp['a'] = [exist];
        temp['b'] = 1;
    }
    temp['a'] = temp['a'].concat(additional['a'] || additional);
    return temp;
};

//let View_MxEvt = /\smx-(?!view|vframe)[a-z]+\s*=\s*"/g;

let View_DestroyAllResources = (me, lastly) => {
    let cache = me['$r'], //reources
        p, c;
    for (p in cache) {
        c = cache[p];
        if (lastly || c.x) { //destroy
            View_DestroyResource(cache, p, 1);
        }
    }
};
let View_DestroyResource = (cache, key, callDestroy, old) => {
    let o = cache[key],
        fn, res;
    if (o && o != old) {
        //let processed=false;
        res = o.e; //entity
        fn = res.destroy;
        if (fn && callDestroy) {
            G_ToTry(fn, G_EMPTY_ARRAY, res);
        }
        delete cache[key];
    }
    return res;
};

let View_WrapMethod = (prop, fName, short, fn, me) => {
    fn = prop[fName];
    prop[fName] = prop[short] = function (...args) {
        me = this;
        if (me['$b'] > 0) { //signature
            me['$b']++;
            
            me.fire('rendercall');
            
            
            View_DestroyAllResources(me);
            
            
            G_ToTry(fn, args, me);
            
        }
    };
};
let View_DelegateEvents = (me, destroy) => {
    let e, { '$eo': eventsObject,
        '$so': selectorObject,
        '$el': eventsList, id } = me; //eventsObject
    for (e in eventsObject) {
        Body_DOMEventBind(e, selectorObject[
            e], destroy);
    }
    for (e of eventsList) {
        G_DOMEventLibBind(e.e, e.n, G_DOMGlobalProcessor, destroy, {
            i: id,
            v: me,
            f: e.f,
            m: e.m,
            e: e.e
        });
    }
};
let View_Globals = {
    win: G_WINDOW,
    doc: G_DOCUMENT
};

let View_MergeMixins = (mixins, proto, ctors) => {
    let temp = {}, p, node, fn, exist;
    for (node of mixins) {
        for (p in node) {
            fn = node[p];
            exist = temp[p];
            if (p == 'ctor') {
                ctors.push(fn);
                continue;
            } else if (View_EvtMethodReg.test(p)) {
                if (exist) {
                    fn = processMixinsSameEvent(exist, fn);
                } else {
                    fn['b'] = 1;
                }
            } else if (DEBUG && exist && p != 'extend' && p != G_SPLITER) { //只在开发中提示
                Magix_Cfg.error(Error('merge duplicate:' + p));
            }
            temp[p] = fn;
        }
    }
    for (p in temp) {
        if (!G_Has(proto, p)) {
            proto[p] = temp[p];
        }
    }
};

function merge(...args) {
    let me = this, _ = me._ || (me._ = []);
    View_MergeMixins(args, me[G_PROTOTYPE], _);
    return me;
}

function extend(props, statics) {
    let me = this;
    props = props || {};
    let ctor = props.ctor;
    
    let ctors = [];
    if (ctor) ctors.push(ctor);
    
    function NView(nodeId, ownerVf, initParams, mixinCtors , cs, z, concatCtors) {
        me.call(z = this, nodeId, ownerVf, initParams, mixinCtors);
        cs = NView._;
        
        if (cs) G_ToTry(cs, initParams, z);
        concatCtors = ctors.concat(mixinCtors);
        if (concatCtors.length) {
            G_ToTry(concatCtors, initParams, z);
        }
        
    }
    NView.merge = merge;
    NView.extend = extend;
    return G_Extend(NView, me, props, statics);
}
/**
 * 预处理view
 * @param  {View} oView view子类
 * @param  {Vom} vom vom
 */
let View_Prepare = oView => {
    if (!oView[G_SPLITER]) { //只处理一次
        oView[G_SPLITER] = [] ;
        let prop = oView[G_PROTOTYPE],
            currentFn, matches, selectorOrCallback, events, eventsObject = {},
            eventsList = [],
            selectorObject = {},
            node, isSelector, p, item, mask, mod, modifiers;

        
        matches = prop.mixins;
        if (matches) {
            View_MergeMixins(matches, prop, oView[G_SPLITER]);
        }
        
        for (p in prop) {
            currentFn = prop[p];
            matches = p.match(View_EvtMethodReg);
            if (matches) {
                [, isSelector, selectorOrCallback, events, modifiers] = matches;
                mod = {};
                if (modifiers) {
                    modifiers = modifiers.split(G_COMMA);
                    for (item of modifiers) {
                        mod[item] = true;
                    }
                }
                events = events.split(G_COMMA);
                for (item of events) {
                    node = View_Globals[selectorOrCallback];
                    mask = 1;
                    if (isSelector) {
                        if (node) {
                            eventsList.push({
                                f: currentFn,
                                e: node,
                                n: item,
                                m: mod
                            });
                            continue;
                        }
                        mask = 2;
                        node = selectorObject[item];
                        if (!node) {
                            node = selectorObject[item] = [];
                        }
                        if (!node[selectorOrCallback]) {
                            node[selectorOrCallback] = 1;
                            node.push(selectorOrCallback);
                        }
                    }
                    eventsObject[item] = eventsObject[item] | mask;
                    item = selectorOrCallback + G_SPLITER + item;
                    node = prop[item];
                    
                    //for in 就近遍历，如果有则忽略
                    if (!node) { //未设置过
                        prop[item] = currentFn;
                    } else if (node['b']) { //现有的方法是mixins上的
                        if (currentFn['b']) { //2者都是mixins上的事件，则合并
                            prop[item] = processMixinsSameEvent(currentFn, node);
                        } else if (G_Has(prop, p)) { //currentFn方法不是mixin上的，也不是继承来的，在当前view上，优先级最高
                            prop[item] = currentFn;
                        }
                    }
                    
                }
            }
        }
        //console.log(prop);
        View_WrapMethod(prop, 'render', '$f');
        prop['$eo'] = eventsObject;
        prop['$el'] = eventsList;
        prop['$so'] = selectorObject;
        prop['$h'] = prop.assign;
    }
    
    return oView[G_SPLITER];
    
};

if (DEBUG) {
    var Updater_CheckInput = (view, html) => {
        if (/<(?:input|textarea|select)/i.test(html)) {
            let url = G_ParseUri(view.owner.path);
            let found = false, hasParams = false;
            for (let p in url.params) {
                hasParams = true;
                if (url.params[p][0] == G_SPLITER) {
                    found = true;
                }
            }
            if (hasParams && !found) {
                console.warn('[!use at to pass parameter] path:' + view.owner.path + ' at ' + (view.owner.parent().path));
            }
        }
    };
}
let Updater_EM = {
    '&': 'amp',
    '<': 'lt',
    '>': 'gt',
    '"': '#34',
    '\'': '#39',
    '\`': '#96'
};
let Updater_ER = /[&<>"'\`]/g;
let Updater_Safeguard = v => '' + (v == null ? '' : v);
let Updater_EncodeReplacer = m => `&${Updater_EM[m]};`;
let Updater_Encode = v => Updater_Safeguard(v).replace(Updater_ER, Updater_EncodeReplacer);

let Updater_Ref = ($$, v, k, f) => {
    for (f = $$[G_SPLITER]; --f;)
        if ($$[k = G_SPLITER + f] === v) return k;
    $$[k = G_SPLITER + $$[G_SPLITER]++] = v;
    return k;
};
let Updater_UM = {
    '!': '%21',
    '\'': '%27',
    '(': '%28',
    ')': '%29',
    '*': '%2A'
};
let Updater_URIReplacer = m => Updater_UM[m];
let Updater_URIReg = /[!')(*]/g;
let Updater_EncodeURI = v => encodeURIComponent(Updater_Safeguard(v)).replace(Updater_URIReg, Updater_URIReplacer);

let Updater_QR = /[\\'"]/g;
let Updater_EncodeQ = v => Updater_Safeguard(v).replace(Updater_QR, '\\$&');


let Updater_Digest = (view, digesting) => {
    let keys = view['$i'],
        changed = view['$j'],
        selfId = view.id,
        vf = Vframe_Vframes[selfId],
        ref = { d: [], v: [], n: [] },
        node = G_GetById(selfId),
        tmpl, vdom, data = view['$d'],
        refData = view['$a'],
        redigest = trigger => {
            if (digesting.i < digesting.length) {
                Updater_Digest(updater, digesting);
            } else {
                ref = digesting.slice();
                digesting.i = digesting.length = 0;
                
                if (trigger) {
                    view.fire('domready');
                }
                
                G_ToTry(ref);
            }
        };
    digesting.i = digesting.length;
    view['$j'] = 0;
    view['$i'] = {};
    if (changed && view['$b'] > 0 && (tmpl = view.tmpl)) {
        view.fire('dompatch');
        delete Body_RangeEvents[selfId];
        delete Body_RangeVframes[selfId];
        
        vdom = tmpl(data, Q_Create, selfId, refData, Updater_Safeguard, Updater_EncodeURI, Updater_Ref, Updater_EncodeQ, G_IsArray, G_Assign);
        if (DEBUG) {
            Updater_CheckInput(view, vdom['a']);
        }
        
        
        V_SetChildNodes(node, view['$n'], vdom, ref, vf, keys);
        view['$n'] = vdom;
        
        for (vdom of ref.d) {
            vdom[0].id = vdom[1];
        }
        /*
            在dom diff patch时，如果已渲染的vframe有变化，则会在vom tree上先派发created事件，同时传递inner标志，vom tree处理alter事件派发状态，未进入created事件派发状态

            patch完成后，需要设置vframe hold fire created事件，因为带有assign方法的view在调用render后，vom tree处于就绪状态，此时会导致提前派发created事件，应该hold，统一在endUpdate中派发

            有可能不需要endUpdate，所以hold fire要视情况而定
        */
        vf['$b'] = tmpl = ref.c || !view['$g'];
        for (vdom of ref.v) {
            vdom['$f']();
        }
        if (tmpl) {
            view.endUpdate(selfId);
        }
        
        if (ref.c) {
            G_Trigger(G_DOCUMENT, 'htmlchanged', {
                vId: selfId
            });
        }
        
        redigest(1);
    } else {
        redigest();
    }
};

/**
 * View类
 * @name View
 * @class
 * @constructor
 * @borrows Event.on as #on
 * @borrows Event.fire as #fire
 * @borrows Event.off as #off
 * @param {Object} ops 创建view时，需要附加到view对象上的其它属性
 * @property {String} id 当前view与页面vframe节点对应的id
 * @property {Vframe} owner 拥有当前view的vframe对象
 * @example
 * // 关于事件:
 * // html写法：
 *
 * //  &lt;input type="button" mx-click="test({id:100,name:'xinglie'})" value="test" /&gt;
 * //  &lt;a href="http://etao.com" mx-click="test({com:'etao.com'})"&gt;http://etao.com&lt;/a&gt;
 *
 * // js写法：
 *
 *     'test&lt;click&gt;':function(e){
 *          e.preventDefault();
 *          //e.current 处理事件的dom节点(即带有mx-click属性的节点)
 *          //e.target 触发事件的dom节点(即鼠标点中的节点，在current里包含其它节点时，current与target有可能不一样)
 *          //e.params  传递的参数
 *          //e.params.com,e.params.id,e.params.name
 *      },
 *      'test&lt;mousedown&gt;':function(e){
 *
 *       }
 *
 *  //上述示例对test方法标注了click与mousedown事件，也可以合写成：
 *  'test&lt;click,mousedown&gt;':function(e){
 *      alert(e.type);//可通过type识别是哪种事件类型
 *  }
 */


function View(id, owner, ops, me) {
    me = this;
    me.owner = owner;
    me.id = id;
    
    
    me['$r'] = {};
    
    me['$b'] = 1; //标识view是否刷新过，对于托管的函数资源，在回调这个函数时，不但要确保view没有销毁，而且要确保view没有刷新过，如果刷新过则不回调
    me['$j'] = 1;
    me['$d'] = {
        id
    };
    me['$a'] = {
        [G_SPLITER]: 1
    };
    me['$e'] = [];
    me['$i'] = {};
    
    id = View._;
    if (id) G_ToTry(id, ops, me);
    
}
G_Assign(View, {
    /**
     * @lends View
     */
    /**
     * 扩展View
     * @param  {Object} props 扩展到原型上的方法
     * @example
     * define('app/tview',function(require){
     *     let Magix = require('magix');
     *     Magix.View.merge({
     *         ctor:function(){
     *             this.$attr='test';
     *         },
     *         test:function(){
     *             alert(this.$attr);
     *         }
     *     });
     * });
     * //加入Magix.config的exts中
     *
     *  Magix.config({
     *      //...
     *      exts:['app/tview']
     *
     *  });
     *
     * //这样完成后，所有的view对象都会有一个$attr属性和test方法
     * //当然上述功能也可以用继承实现，但继承层次太多时，可以考虑使用扩展来消除多层次的继承
     * //同时当项目进行中发现所有view要实现某个功能时，该方式比继承更快捷有效
     *
     *
     */
    
    merge,
    
    /**
     * 继承
     * @param  {Object} [props] 原型链上的方法或属性对象
     * @param {Function} [props.ctor] 类似constructor，但不是constructor，当我们继承时，你无需显示调用上一层级的ctor方法，magix会自动帮你调用
     * @param {Array} [props.mixins] mix到当前原型链上的方法对象，该对象可以有一个ctor方法用于初始化
     * @param  {Object} [statics] 静态对象或方法
     * @example
     * let Magix = require('magix');
     * let Sortable = {
     *     ctor: function() {
     *         console.log('sortable ctor');
     *         //this==当前mix Sortable的view对象
     *         this.on('destroy', function() {
     *             console.log('dispose')
     *         });
     *     },
     *     sort: function() {
     *         console.log('sort');
     *     }
     * };
     * module.exports = Magix.View.extend({
     *     mixins: [Sortable],
     *     ctor: function() {
     *         console.log('view ctor');
     *     },
     *     render: function() {
     *         this.sort();
     *     }
     * });
     */
    extend
});
G_Assign(View[G_PROTOTYPE] , MEvent, {
    /**
     * @lends View#
     */
    
    /**
     * 初始化调用的方法
     * @beta
     * @module viewInit
     * @param {Object} extra 外部传递的数据对象
     */
    init: G_NOOP,
    
    /*
     * 包装mx-event事件，比如把mx-click="test<prevent>({key:'field'})" 包装成 mx-click="magix_vf_root^test<prevent>({key:'field})"，以方便识别交由哪个view处理
     * @function
     * @param {String} html 处理的代码片断
     * @param {Boolean} [onlyAddPrefix] 是否只添加前缀
     * @return {String} 处理后的字符串
     * @example
     * View.extend({
     *     'del&lt;click&gt;':function(e){
     *         S.one(G_HashKey+e.currentId).remove();
     *     },
     *     'addNode&lt;click&gt;':function(e){
     *         let tmpl='&lt;div mx-click="del"&gt;delete&lt;/div&gt;';
     *         //因为tmpl中有mx-click，因此需要下面这行代码进行处理一次
     *         tmpl=this.wrapEvent(tmpl);
     *         S.one(G_HashKey+e.currentId).append(tmpl);
     *     }
     * });
     */
    /**
     * 通知当前view即将开始进行html的更新
     * @param {String} [id] 哪块区域需要更新，默认整个view
     */
    beginUpdate(id, me) {
        me = this;
        if (me['$b'] > 0 && me['$g']) {
            me.owner.unmountZone(id, 1);
            /*me.fire('prerender', {
                id: id
            });*/
        }
    },
    /**
     * 通知当前view结束html的更新
     * @param {String} [id] 哪块区域结束更新，默认整个view
     */
    endUpdate(id, inner, me , o, f ) {
        me = this;
        if (me['$b'] > 0) {
            id = id || me.id;
            /*me.fire('rendered', {
                id
            });*/
            if (inner) {
                f = inner;
            } else {
                
                f = me['$g'];
                
                me['$g'] = 1;
            }
            
            o = me.owner;
            o.mountZone(id, inner);
            if (!f) {
                
                Timeout(me.wrapAsync(Vframe_RunInvokes), 0, o);
                
            }
            
        }
    },
    
    /**
     * 包装异步回调
     * @param  {Function} fn 异步回调的function
     * @return {Function}
     * @example
     * render:function(){
     *     setTimeout(this.wrapAsync(function(){
     *         //codes
     *     }),50000);
     * }
     * // 为什么要包装一次？
     * // 在单页应用的情况下，可能异步回调执行时，当前view已经被销毁。
     * // 比如上例中的setTimeout，50s后执行回调，如果你的回调中去操作了DOM，
     * // 则会出错，为了避免这种情况的出现，可以调用view的wrapAsync包装一次。
     * // (该示例中最好的做法是在view销毁时清除setTimeout，
     * // 但有时候你很难控制回调的执行，比如JSONP，所以最好包装一次)
     */
    wrapAsync(fn, context) {
        let me = this;
        let sign = me['$b'];
        return (...a) => {
            if (sign > 0 && sign == me['$b']) {
                return fn.apply(context || me, a);
            }
        };
    },
    
    
    
    
    
    
    /**
     * 让view帮你管理资源，强烈建议对组件等进行托管
     * @param {String} key 资源标识key
     * @param {Object} res 要托管的资源
     * @param {Boolean} [destroyWhenCalleRender] 调用render方法时是否销毁托管的资源
     * @return {Object} 返回托管的资源
     * @beta
     * @module resource
     * @example
     * View.extend({
     *     render: function(){
     *         let me = this;
     *         let dropdown = new Dropdown();
     *
     *         me.capture('dropdown',dropdown,true);
     *     },
     *     getTest: function(){
     *         let dd = me.capture('dropdown');
     *         console.log(dd);
     *     }
     * });
     */
    capture(key, res, destroyWhenCallRender, cache) {
        cache = this['$r'];
        if (res) {
            View_DestroyResource(cache, key, 1, res);
            cache[key] = {
                e: res,
                x: destroyWhenCallRender
            };
            //service托管检查
            if (DEBUG && res && (res.id + G_EMPTY).indexOf('\x1es') === 0) {
                res['$a'] = 1;
                if (!destroyWhenCallRender) {
                    console.warn('beware! May be you should set destroyWhenCallRender = true');
                }
            }
        } else {
            cache = cache[key];
            res = cache && cache.e;
        }
        return res;
    },
    /**
     * 释放管理的资源
     * @param  {String} key 托管时的key
     * @param  {Boolean} [destroy] 是否销毁资源
     * @return {Object} 返回托管的资源，无论是否销毁
     * @beta
     * @module resource
     */
    release(key, destroy) {
        return View_DestroyResource(this['$r'], key, destroy);
    },
    
    
    /**
     * 设置view的html内容
     * @param {String} id 更新节点的id
     * @param {Strig} html html字符串
     * @example
     * render:function(){
     *     this.setHTML(this.id,this.tmpl);//渲染界面，当界面复杂时，请考虑用其它方案进行更新
     * }
     */
    /*
        Q:为什么删除setHTML?
        A:统一使用updater更新界面。
        关于api的分级，高层api更内聚，一个api完成很多功能。方便开发者，但不灵活。
        底层api职责更单一，一个api只完成一个功能，灵活，但不方便开发者
        更新界面来讲，updater是一个高层api，但是有些功能却无法完成，如把view当成壳子或容器渲染第三方的组件，组件什么时间加载完成、渲染、更新了dom、如何通知magix等，这些问题在updater中是无解的，而setHTML这个api又不够底层，同样也无法完成一些功能，所以这个api食之无味，故删除
     */
    /*setHTML(id, html) {
        let me = this,
            n, i = me.id;
        me.beginUpdate(id);
        if (me['$b'] > 0) {
            n = G_GetById(id);
            if (n) G_HTML(n, View_SetEventOwner(html, i), i);
        }
        me.endUpdate(id);
        me.fire('domready');
    }*/
    /**
     * 渲染view，供最终view开发者覆盖
     * @function
     */
    render: G_NOOP,
    /**
     * 获取放入的数据
     * @param  {String} [key] key
     * @return {Object} 返回对应的数据，当key未传递时，返回整个数据对象
     * @example
     * render: function() {
     *     this.set({
     *         a: 10,
     *         b: 20
     *     });
     * },
     * 'read&lt;click&gt;': function() {
     *     console.log(this.get('a'));
     * }
     */
    get(key, result) {
        result = this['$d'];
        if (key) {
            result = result[key];
        }
        return result;
    },
    /**
     * 通过path获取值
     * @param  {String} path 点分割的路径
     * @return {Object}
     */
    /*gain: function (path) {
        let result = this.$d;
        let ps = path.split('.'),
            temp;
        while (result && ps.length) {
            temp = ps.shift();
            result = result[temp];
        }
        return result;
    },*/
    /**
     * 获取放入的数据
     * @param  {Object} obj 待放入的数据
     * @return {Updater} 返回updater
     * @example
     * render: function() {
     *     this.set({
     *         a: 10,
     *         b: 20
     *     });
     * },
     * 'read&lt;click&gt;': function() {
     *     console.log(this.get('a'));
     * }
     */
    set(obj, unchanged) {
        let me = this;
        me['$j'] = G_Set(obj, me['$d'], me['$i'], unchanged) || me['$j'];
        return me;
    },
    /**
     * 检测数据变化，更新界面，放入数据后需要显式调用该方法才可以把数据更新到界面
     * @example
     * render: function() {
     *     this.updater.set({
     *         a: 10,
     *         b: 20
     *     }).digest();
     * }
     */
    digest(data, unchanged, resolve) {
        let me = this.set(data, unchanged),
            digesting = me['$e']
            ;
        /*
            view:
            <div>
                <mx-dropdown mx-focusout="rerender()"/>
            <div>

            view.digest=>dropdown.focusout=>view.redigest=>view.redigest.end=>view.digest.end

            view.digest中嵌套了view.redigest，view.redigest可能操作了view.digest中引用的dom,这样会导致view.redigest.end后续的view.digest中出错

            expect
            view.digest=>dropdown.focusout=>view.digest.end=>view.redigest=>view.redigest.end

            如果在digest的过程中，多次调用自身的digest，则后续的进行排队。前面的执行完成后，排队中的一次执行完毕
        */
        
        if (resolve) {
            digesting.push(resolve);
        }
        if (!digesting.i) {
            Updater_Digest(me, digesting);
        } else if (DEBUG) {
            console.warn('Avoid redigest while updater is digesting');
        }
        
    }
    /**
     * 当前view的dom就绪后触发
     * @name View#domready
     * @event
     * @param {Object} e view 完成渲染后触发
     */

    /**
     * view销毁时触发
     * @name View#destroy
     * @event
     * @param {Object} e
     */

    /**
     * 异步更新ui的方法(render)被调用前触发
     * @name View#rendercall
     * @event
     * @param {Object} e
     */
});
Magix.View = View;
    
    let G_Now = Date.now;
    
    
    /*
    一个请求send后，应该取消吗？
    参见xmlhttprequest的实现
        https://chromium.googlesource.com/chromium/blink/+/master/Source/core
        https://chromium.googlesource.com/chromium/blink/+/master/Source/core/xmlhttprequest/XMLHttpService.cpp
    当请求发出，服务器接受到之前取消才有用，否则连接已经建立，数据开始传递，中止只会浪费。
    但我们很难在合适的时间点abort，而且像jsonp的，我们根本无法abort掉，只能任数据返回

    然后我们在自已的代码中再去判断、决定回调是否调用

    那我们是否可以这样做：
        1. 不取消请求
        2. 请求返回后尽可能的处理保留数据，比如缓存。处理完成后才去决定是否调用回调（Service_Send中的Done实现）

    除此之外，我们还要考虑
        1. 跨请求对象对同一个缓存的接口进行请求，而某一个销毁了。
            Service.add([{
                name:'Test',
                url:'/test',
                cache:20000
            }]);

            let r1=new Service();
            r1.all('Test',function(e,m){

            });

            let r2=new Service();
            r2.all('Test',function(e,m){

            });

            r1.destroy();

            如上代码，我们在实现时：
            r2在请求Test时，此时Test是可缓存的，并且Test已经处于r1请求中了，我们不应该再次发起新的请求，只需要把回调排队到r1的Test请求中即可。参见代码：Service_Send中的for,Service.cached。

            当r1进行销毁时，并不能贸然销毁r1上的所有请求，如Test请求不能销毁，只能从回调中标识r1的回调不能再被调用。r1的Test还要继续，参考上面讨论的请求应该取消吗。就算能取消，也需要查看Test的请求中，除了r1外是否还有别的请求要用，我们示例中是r2，所以仍然继续请求。参考Service#.destroy


 */
/**
 * Bag类
 * @name Bag
 * @beta
 * @module service
 * @constructor
 * @property {String} id bag唯一标识
 */

function Bag() {
    this.id = G_Id('b');
    this.$ = {};
}
G_Assign(Bag[G_PROTOTYPE], {
    /**
     * @lends Bag#
     */
    /**
     * 获取属性
     * @param {String} [key] 要获取数据的key
     * @param {Object} [dValue] 当根据key取到的值为falsy时，使用默认值替代，防止代码出错
     * @return {Object}
     * @example
     * new Serice().one({
     *     name:'Test'
     * },function(error,bag){
     *     let obj=bag.get();//获取所有数据
     *
     *     let list=bag.get('list',[]);//获取list数据，如果不存在list则使用空数组
     *
     *     let count=bag.get('data.info.count',0);//获取data下面info下count的值，您无须关心data下是否有info属性
     *     console.log(list);
     * });
     */
    get(key, dValue) {
        let me = this;
        //let alen = arguments.length;
        /*
            目前只处理了key中不包含.的情况，如果key中包含.则下面的简单的通过split('.')的方案就不行了，需要改为：

            let reg=/[^\[\]]+(?=\])|[^.\[\]]+/g;
            let a=['a.b.c','a[b.c].d','a[0][2].e','a[b.c.d][eg].a.b.c','[e.g.d]','a.b[c.d.fff]'];

            for(let i=0,one;i<a.length;i++){
              one=a[i];
              console.log(one.match(reg))
            }

            但考虑到key中有.的情况非常少，则优先使用性能较高的方案

            或者key本身就是数组
         */
        let attrs = me.$;
        if (key) {
            let tks = G_IsArray(key) ? key.slice() : (key + G_EMPTY).split('.'),
                tk;
            while ((tk = tks.shift()) && attrs) {
                attrs = attrs[tk];
            }
            if (tk) {
                attrs = G_Undefined;
            }
        }
        let type;
        if (dValue !== G_Undefined && (type = G_Type(dValue)) != G_Type(attrs)) {
            if (DEBUG) {
                console.warn('type neq:' + key + ' is not a(n) ' + type);
            }
            attrs = dValue;
        }
        if (DEBUG && me['$b'] && me['$b'].k) { //缓存中的接口不让修改数据
            attrs = Safeguard(attrs);
        }
        return attrs;
    },
    /**
     * 设置属性
     * @param {String|Object} key 属性对象或属性key
     * @param {Object} [val] 属性值
     */
    set(key, val) {
        if (!G_IsObject(key)) {
            key = { [key]: val };
        }
        G_Assign(this.$, key);
    }
});
let Service_FetchFlags_ONE = 1;
let Service_FetchFlags_ALL = 2;
function Service_CacheDone(cacheKey, err, fns) {
    fns = this[cacheKey]; //取出当前的缓存信息
    if (fns) {
        delete this[cacheKey]; //先删除掉信息
        G_ToTry(fns, err, fns.e); //执行所有的回调
    }
}
let Service_Task = (done, host, service, total, flag, bagCache) => {
    let doneArr = [];
    let errorArgs = G_NULL;
    let currentDoneCount = 0;

    return function (idx, error) {
        currentDoneCount++; //当前完成加1.
        let bag = this;
        let newBag;
        let mm = bag['$b'];
        let cacheKey = mm.k, temp;
        doneArr[idx + 1] = bag; //完成的bag
        if (error) { //出错
            errorArgs = error;
            //errorArgs[idx] = err; //记录相应下标的错误信息
            //G_Assign(errorArgs, err);
            newBag = 1; //标记当前是一个新完成的bag,尽管出错了
        } else if (!bagCache.has(cacheKey)) { //如果缓存对象中不存在，则处理。注意在开始请求时，缓存与非缓存的都会调用当前函数，所以需要在该函数内部做判断处理
            if (cacheKey) { //需要缓存
                bagCache.set(cacheKey, bag); //缓存
            }
            //bag.set(data);
            mm.t = G_Now(); //记录当前完成的时间
            temp = mm.a;
            if (temp) { //有after
                G_ToTry(temp, bag, bag);
            }
            temp = mm.x;
            if (temp) { //需要清理
                host.clear(temp);
            }
            newBag = 1;
        }
        if (!service['$d']) { //service['$d'] 当前请求被销毁
            let finish = currentDoneCount == total;
            if (finish) {
                service['$e'] = 0;
                if (flag == Service_FetchFlags_ALL) { //all
                    doneArr[0] = errorArgs;
                    G_ToTry(done, doneArr, service);
                }
            }
            if (flag == Service_FetchFlags_ONE) { //如果是其中一个成功，则每次成功回调一次
                G_ToTry(done, [error || G_NULL, bag, finish, idx], service);
            }
        }
        if (newBag) { //不管当前request或回调是否销毁，均派发end事件，就像前面缓存一样，尽量让请求处理完成，该缓存的缓存，该派发事件派发事件。
            host.fire('end', {
                bag,
                error
            });
        }
    };
};
/**
 * 获取attrs，该用缓存的用缓存，该发起请求的请求
 * @private
 * @param {Object|Array} attrs 获取attrs时的描述信息，如:{name:'Home',urlParams:{a:'12'},formParams:{b:2}}
 * @param {Function} done   完成时的回调
 * @param {Integer} flag   获取哪种类型的attrs
 * @param {Boolean} save 是否是保存的动作
 * @return {Service}
 */
let Service_Send = (me, attrs, done, flag, save) => {
    if (me['$d']) return me; //如果已销毁，返回
    if (me['$e']) { //繁忙，后续请求入队
        return me.enqueue(Service_Send.bind(me, me, attrs, done, flag, save));
    }
    me['$e'] = 1; //标志繁忙
    if (!G_IsArray(attrs)) {
        attrs = [attrs];
    }
    let host = me.constructor,
        requestCount = 0;
    //let bagCache = host['$c']; //存放bag的Cache对象
    let bagCacheKeys = host['$f']; //可缓存的bag key
    let remoteComplete = Service_Task(done, host, me, attrs.length, flag, host['$c']);
    
    for (let bag of attrs) {
        if (bag) {
            let bagInfo = host.get(bag, save); //获取bag信息

            let bagEntity = bagInfo.e;
            let cacheKey = bagEntity['$b'].k; //从实体上获取缓存key

            let complete = remoteComplete.bind(bagEntity, requestCount++); //包装当前的完成回调
            let cacheList;

            if (cacheKey && bagCacheKeys[cacheKey]) { //如果需要缓存，并且请求已发出
                bagCacheKeys[cacheKey].push(complete); //放到队列中
            } else if (bagInfo.u) { //需要更新
                if (cacheKey) { //需要缓存
                    cacheList = [complete];
                    cacheList.e = bagEntity;
                    bagCacheKeys[cacheKey] = cacheList;
                    complete = Service_CacheDone.bind(bagCacheKeys, cacheKey); //替换回调，详见Service_CacheDone
                }
                
                host['$s'](bagEntity, complete);
                
            } else { //不需要更新时，直接回调
                complete();
            }
        }
    }
    
    return me;
};
/**
 * 接口请求服务类
 * @name Service
 * @constructor
 * @beta
 * @module service
 * @borrows Event.on as on
 * @borrows Event.fire as fire
 * @borrows Event.off as off
 * @example
 * let S = Magix.Service.extend(function(bag,callback){
 *     $.ajax({
 *         url:bag.get('url'),
 *         success:function(data){
 *             bag.set('data',data)//设置数据
 *             callback();//通知内部完成数据请求
 *         },
 *         error:function(msg){
 *             callback(msg);//出错
 *         }
 *     })
 * });
 * // 添加接口
 * S.add({
 *     name:'test',
 *     url:'/test',
 *     cache:1000*60 //缓存一分钟
 * });
 * // 使用接口
 * let s=new S();
 * s.all('test',function(err,bag){
 *     console.log(err,bag);
 * });
 */
function Service() {
    let me = this;
    me.id = G_Id('s');
    if (DEBUG) {
        me.id = G_Id('\x1es');
        setTimeout(() => {
            if (!me['$a']) {
                console.warn('beware! You should use view.capture to connect Service and View');
            }
        }, 1000);
    }
    me['$g'] = [];
}

G_Assign(Service[G_PROTOTYPE], {
    /**
     * @lends Service#
     */
    /**
     * 获取attrs，所有请求完成回调done
     * @function
     * @param {Object|Array} attrs 获取attrs时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},formParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {Service}
     * @example
     * new Service().all([{
     *     name:'Test1'
     * },{
     *     name:'Test2'
     * }],function(err,bag1,bag2){
     *     console.log(arguments);
     * });
     */
    all(attrs, done) {
        return Service_Send(this, attrs, done, Service_FetchFlags_ALL);
    },
    /**
     * 保存attrs，所有请求完成回调done
     * @function
     * @param {Object|Array} attrs 保存attrs时的描述信息，如:{name:'Home',urlParams:{a:'12'},formParams:{b:2}}
     * @param {Function} done   完成时的回调
     * @return {Service}
     * @example
     * // 同all,但与all不同的是，当指定接口缓存时，all方法会优先使用缓存，而save方法则每次都会发送请求到服务器，忽略掉缓存。同时save更语义化
     */
    save(attrs, done) {
        return Service_Send(this, attrs, done, Service_FetchFlags_ALL, 1);
    },
    /**
     * 获取attrs，其中任意一个成功均立即回调，回调会被调用多次。注：当使用promise时，不存在该方法。
     * @function
     * @param {Object|Array} attrs 获取attrs时的描述信息，如:{name:'Home',cacheKey:'key',urlParams:{a:'12'},formParams:{b:2}}
     * @param {Function} callback   完成时的回调
     * @beta
     * @return {Service}
     * @example
     *  //代码片断：
     * let s = new Service().one([
     *     {name:'M1'},
     *     {name:'M2'},
     *     {name:'M3'}
     * ],function(err,bag){//m1,m2,m3，谁快先调用谁，且被调用三次
     *     if(err){
     *         alert(err.msg);
     *     }else{
     *         alert(bag.get('name'));
     *     }
     * });
     */
    one(attrs, done) {
        return Service_Send(this, attrs, done, Service_FetchFlags_ONE);
    },
    /**
     * 前一个all,one或save任务做完后的下一个任务
     * @param  {Function} callback 当前面的任务完成后调用该回调
     * @return {Service}
     * @beta
     * @example
     * let r = new Service().all([
     *     {name:'M1'},
     *     {name:'M2'}
     * ],function(err,bag1,bag2){
     *     r.dequeue(['args1','args2']);
     * });
     * r.enqueue(function(args1,args2){
     *     alert([args1,args2]);
     * });
     */
    enqueue(callback) {
        let me = this;
        if (!me['$d']) {
            me['$g'].push(callback);
            me.dequeue(me['$h']);
        }
        return me;
    },
    /**
     * 做下一个任务
     * @param {Array} preArgs 传递的参数
     * @beta
     * @example
     * let r = new Service();
     * r.all('Name',function(e,bag){
     *     r.dequeue([e,bag]);
     * });
     * r.enqueue(function(e,result){//result为m
     *     r.all('NextName',function(e,bag){
     *         r.dequeue([e,bag]);
     *     });
     * });
     *
     * r.enqueue(function(e,bag){//m===queue m;
     *     console.log(e,bag);
     *     r.dequeue([e,bag]);
     * });
     *
     * r.enqueue(function(e,bag){
     *     console.log(e,bag);
     * });
     *
     * //当出错时，e为出错的信息
     */
    dequeue(...a) {
        let me = this,
            one;
        if (!me['$e'] && !me['$d']) {
            me['$e'] = 1;
            Timeout(() => { //前面的任务可能从缓存中来，执行很快
                me['$e'] = 0;
                if (!me['$d']) { //不清除setTimeout,但在回调中识别是否调用了destroy方法
                    one = me['$g'].shift();
                    if (one) {
                        G_ToTry(one, me['$h'] = a);
                    }
                }
            },0);
        }
    },
    /**
     * 销毁当前请求，不可以继续发起新请求，而且不再调用相应的回调
     */
    destroy(me) {
        me = this;
        me['$d'] = 1; //只需要标记及清理即可，其它的不需要
        me['$g'] = 0;
    }
    /**
     * 当Service发送请求前触发
     * @name Service.begin
     * @event
     * @param {Object} e 事件对象
     * @param {Bag} e.bag bag对象
     * @example
     * let S = Magix.Service.extend({
     *     //codes
     * });
     *
     * S.on('begin',function(e){//监听所有的开始请求事件
     *     console.log(e);
     * });
     */
    /**
     * 当Service结束请求时触发(成功或失败均触发)
     * @name Service.end
     * @event
     * @param {Object} e 事件对象
     * @param {Bag} e.bag bag对象
     * @param {String} e.error 当请求出错时，error是出错的消息
     */
    /**
     * 当Service发送请求失败时触发
     * @name Service.fail
     * @event
     * @param {Object} e 事件对象
     * @param {Bag} e.bag bag对象
     * @param {String} e.error 当请求出错时，error是出错的消息
     */
    /**
     * 当Service发送请求成功时触发
     * @name Service.done
     * @event
     * @param {Object} e 事件对象
     * @param {Bag} e.bag bag对象
     */
});

let Manager_DefaultCacheKey = (meta, attrs, arr) => {
    arr = [JSONStringify(attrs), JSONStringify(meta)];
    return arr.join(G_SPLITER);
};
let Manager_ClearCache = (v, ns, cache, mm) => {
    mm = v && v['$b'];
    if (mm && ns[mm.n]) {
        cache.del(mm.k);
    }
};
let Service_Manager = {
    /**
     * @lends Service
     */
    /**
     * 添加元信息
     * @param {Object} attrs 信息属性
     */
    add(attrs) {
        let me = this;
        let metas = me['$b'],
            bag;
        if (!G_IsArray(attrs)) {
            attrs = [attrs];
        }
        for (bag of attrs) {
            if (bag) {
                let { name, cache } = bag;
                bag.cache = cache | 0;
                metas[name] = bag;
            }
        }
    },
    /**
     * 创建bag对象
     * @param {Object} attrs           bag描述信息对象
     * @return {Bag}
     */
    create(attrs) {
        let me = this;
        let meta = me.meta(attrs);
        let cache = (attrs.cache | 0) || meta.cache;
        let entity = new Bag();
        entity.set(meta);
        entity['$b'] = {
            n: meta.name,
            a: meta.after,
            x: meta.cleans,
            k: cache && Manager_DefaultCacheKey(meta, attrs)
        };

        if (G_IsObject(attrs)) {
            entity.set(attrs);
        }
        let before = meta.before;
        if (before) {
            G_ToTry(before, entity, entity);
        }
        me.fire('begin', {
            bag: entity
        });
        return entity;
    },
    /**
     * 获取bag注册时的元信息
     * @param  {String|Object} attrs 名称
     * @return {Object}
     * @example
     * let S = Magix.Service.extend({
     *     //extend code
     * });
     *
     * S.add({
     *     name:'test',
     *     url:'/test'
     * });
     *
     * console.log(S.meta('test'),S.meta({name:'test'}));//这2种方式都可以拿到add时的对象信息
     */
    meta(attrs) {
        let me = this;
        let metas = me['$b'];
        let name = attrs.name || attrs;
        let ma = metas[name];
        return ma || attrs;
    },
    /**
     * 获取bag对象，优先从缓存中获取
     * @param {Object} attrs           bag描述信息对象
     * @param {Boolean} createNew 是否是创建新的Bag对象，如果否，则尝试从缓存中获取
     * @return {Object}
     */
    get(attrs, createNew) {
        let me = this;
        let e, u;
        if (!createNew) {
            e = me.cached(attrs);
        }

        if (!e) {
            e = me.create(attrs);
            u = 1;
        }
        return {
            e,
            u
        };
    },
    /**
     * 根据name清除缓存的attrs
     * @param  {String|Array} names 字符串或数组
     * @example
     * let S = Magix.Service.extend({
     *     //extend code
     * });
     *
     * S.add({
     *     name:'test',
     *     url:'/test',
     *     cache:1000*60
     * });
     *
     * let s = new Service();
     * s.all('test');
     * s.all('test');//from cache
     * S.clear('test');
     * s.all('test');//fetch from server
     */
    clear(names) {
        this['$c'].each(Manager_ClearCache, G_ToMap((names + G_EMPTY).split(G_COMMA)));
    },
    /**
     * 从缓存中获取bag对象
     * @param  {Object} attrs
     * @return {Bag}
     * @example
     * let S = Magix.Service.extend({
     *     //extend code
     * });
     *
     * S.add({
     *     name:'test',
     *     url:'/test',
     *     cache:1000*60
     * });
     *
     * S.cached('test');//尝试从缓存中获取bag对象
     */
    cached(attrs) {
        let me = this;
        let bagCache = me['$c'];
        let entity;
        let cacheKey;
        let meta = me.meta(attrs);
        let cache = (attrs.cache | 0) || meta.cache;

        if (cache) {
            cacheKey = Manager_DefaultCacheKey(meta, attrs);
        }

        if (cacheKey) {
            let requestCacheKeys = me['$f'];
            let info = requestCacheKeys[cacheKey];
            if (info) { //处于请求队列中的
                entity = info.e;
            } else { //缓存
                entity = bagCache.get(cacheKey);
                if (entity && G_Now() - entity['$b'].t > cache) {
                    bagCache.del(cacheKey);
                    entity = 0;
                }
            }
        }
        return entity;
    },
    ...MEvent
    
};
/**
 * 继承
 * @lends Service
 * @param  {Function} sync 接口服务同步数据方法
 * @param  {Integer} [cacheMax] 最大缓存数，默认20
 * @param  {Integer} [cacheBuffer] 缓存缓冲区大小，默认5
 * @return {Function} 返回新的接口类
 * @example
 * let S = Magix.Service.extend(function(bag,callback){
 *     $.ajax({
 *         url:bag.get('url'),
 *         success:function(data){
 *             bag.set('data',data);
 *             callback();
 *         },
 *         error:function(msg){
 *             callback({message:msg});
 *         }
 *     })
 * },10,2);//最大缓存10个接口数据，缓冲区2个
 */
Service.extend = (sync, cacheMax, cacheBuffer) => {
    function NService() {
        Service.call(this);
    }
    NService['$s'] = sync;
    NService['$c'] = new G_Cache(cacheMax, cacheBuffer);
    NService['$f'] = {};
    NService['$b'] = {};
    return G_Extend(NService, Service, G_NULL, Service_Manager);
};
Magix.Service = Service;
    
    
    
    Magix.default = Magix;
    return Magix;
});