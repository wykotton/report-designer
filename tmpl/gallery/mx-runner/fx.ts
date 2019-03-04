import Magix from 'magix';
import Runner from './index';
let DALG = t => t;
let Now = Date.now;
let FX = function (interval, alg) {
    let me = this;
    if (!me['@{alg.fn}'] || alg) {
        alg = alg || DALG;
        me['@{alg.fn}'] = (from, to) => {
            return (from + (to - from) * alg(me['@{current.timespan}'] / me['@{item.timespan}']));
        };
    }
    me['@{task.list}'] = [];
    me['@{interval}'] = interval;
};
Magix.mix(FX.prototype, {
    '@{run}'(time, callback) {
        let me = this;
        if (!me['@{destroyed}']) {
            me['@{task.list}'].push({
                '@{timespan}': time,
                '@{fn}': callback
            });
            if (!me['@{for.runner.fn}']) {
                me['@{start.work}']();
            }
        }
    },
    '@{start.work}'() {
        let me = this;
        let item = me['@{task.list}'].shift();
        if (item) {
            me['@{item.timespan}'] = item['@{timespan}'];
            me['@{item.fn}'] = item['@{fn}'];
            me['@{now.time}'] = Now();
            if (!me['@{for.runner.fn}']) {
                Runner['@{task.add}'](me['@{interval}'], me['@{for.runner.fn}'] = end => {
                    me['@{current.timespan}'] = Date.now() - me['@{now.time}'];
                    if (me['@{current.timespan}'] > me['@{item.timespan}']) {
                        me['@{current.timespan}'] = me['@{item.timespan}'];
                        end = 1;
                    }
                    try {
                        me['@{item.fn}'](me['@{alg.fn}']);
                    } catch (e) {
                        end = e;
                    }
                    if (end) {
                        me['@{start.work}']();
                    }
                });
            }
        } else {
            me['@{stop}']();
        }
    },
    '@{stop}'() {
        let me = this;
        if (me['@{for.runner.fn}']) {
            Runner['@{task.remove}'](me['@{for.runner.fn}']);
            delete me['@{for.runner.fn}'];
        }
    },
    '@{destroy}'() {
        let me = this;
        me['@{stop}']();
        me['@{task.list}'] = [];
        me['@{destroyed}'] = 1;
    }
});
export default {
    '@{get.fx}'(interval, alg) {
        let fx = new FX(interval, alg);
        this.on('destroy', () => {
            fx['@{destroy}']();
        });
        return fx;
    }
};