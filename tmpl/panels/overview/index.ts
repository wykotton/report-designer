/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { State, node } from 'magix';
import Dragdrop from '../../gallery/mx-dragdrop/index';
Magix.applyStyle('@index.less');
let StagePadding = [50, 240, 50, 120];
let OverviewSize = [180, 120];
let Idle = window.requestIdleCallback || ((fn) => {
    setTimeout(fn, 500);
});
let CancelIdle = window.cancelIdleCallback || clearTimeout;
export default Magix.View.extend({
    mixins: [Dragdrop],
    tmpl: '@index.html',
    init() {
        let stage = node('stage');
        let updateOverview = this['@{update.ui}'].bind(this);
        State.on('@{event#history.shift}', updateOverview);
        State.on('@{event#stage.scale.change}', updateOverview);
        State.on('@{event#stage.page.change}', updateOverview);
        State.on('@{event#stage.elements.change}', updateOverview);
        State.on('@{event#stage.select.element.props.change}', updateOverview);
        State.on('@{event#stage.select.element.props.update}', updateOverview);
        stage.addEventListener('scroll', this['@{update.viewport.pos}'].bind(this));
    },
    '@{update.ui}'() {
        let me = this;
        CancelIdle(me['@{task.timer}']);
        me['@{task.timer}'] = Idle(this.render.bind(this));
    },
    '@{update.viewport.pos}'() {
        let stage = node('stage');
        let ratio = this.get('ratio');
        if (ratio) {
            let width = this.get('width');
            let height = this.get('height');
            let viewportWidth = this.get('viewportWidth');
            let viewportHeight = this.get('viewportHeight');
            this.digest({
                left: Math.min(stage.scrollLeft * ratio, width - viewportWidth),
                top: Math.min(stage.scrollTop * ratio, height - viewportHeight)
            });
        }
    },
    render() {
        let draw = this.wrapAsync(() => {
            if (!node('stage_canvas')) {
                Idle(draw);
                return;
            }
            let page = State.get('@{stage.page}');
            let scale = State.get('@{stage.scale}');
            let stage = node('stage');
            let stageRealWidth = stage.scrollWidth;
            let stageRealHeight = stage.scrollHeight;
            let width = OverviewSize[0];
            let ratio = width / stageRealWidth;
            let height = ratio * stageRealHeight;
            if (height > OverviewSize[1]) {
                height = OverviewSize[1];
                ratio = height / stageRealHeight;
                width = ratio * stageRealWidth;
            }
            let pageWidth = ratio * page.width * scale;
            let pageHeight = ratio * page.height * scale;
            let canvasMargin = '';
            for (let e of StagePadding) {
                canvasMargin += ratio * e + 'px ';
            }
            let centerMargin = `${(OverviewSize[1] - height) / 2}px ${(OverviewSize[0] - width) / 2}px`;
            let viewportWidth = Math.min(stage.offsetWidth, stageRealWidth) * ratio;//for border
            let viewportHeight = Math.min(stage.offsetHeight, stageRealHeight) * ratio;
            this.set({
                width,
                height,
                page,
                pageWidth,
                pageHeight,
                ratio,
                elements: State.get('@{stage.elements}'),
                viewportHeight,
                viewportWidth,
                canvasMargin,
                centerMargin
            });
            this['@{update.viewport.pos}']();
        });
        draw();
    },
    '@{move.viewport}<mousedown>'(e) {
        let startX = this.get('left'),
            startY = this.get('top'),
            viewportWidth = this.get('viewportWidth'),
            viewportHeight = this.get('viewportHeight'),
            width = this.get('width'),
            height = this.get('height'),
            stage = node('stage'),
            ratio = this.get('ratio');
        this['@{drag.drop}'](e, ex => {
            let x = startX + ex.pageX - e.pageX;
            let y = startY + ex.pageY - e.pageY;
            if (x < 0) {
                x = 0;
            } else if (x > (width - viewportWidth)) {
                x = width - viewportWidth;
            }
            if (y < 0) {
                y = 0;
            } else if (y > (height - viewportHeight)) {
                y = height - viewportHeight;
            }
            // this.digest({
            //     left: x,
            //     top: y
            // });
            stage.scrollLeft = x / ratio;
            stage.scrollTop = y / ratio;
        });
    },
    '$win<resize>'() {
        this['@{update.ui}']();
    }
});