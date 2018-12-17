/*
    author:xinglie.lkf@alibaba-inc.com
*/
import Magix, { node } from 'magix';
export default Magix.View.extend({
    tmpl: '@index.html',
    init(data) {
        this.assign(data);
    },
    assign(data) {
        this.set(data);
        return true;
    },
    render() {
        this.digest();
        let onlyMove = this.get('onlyMove');
        if (onlyMove) return;
        let props = this.get('props');
        if (!this['@{chart.entity}']) {
            this['@{chart.entity}'] = echarts.init(node('chart_' + this.id));
            this.on('destroy', () => {
                console.log('chart dispose');
                this['@{chart.entity}'].dispose();
            });
        }
        let chart = this['@{chart.entity}'];
        // 绘制图表
        chart.setOption({
            series: [{
                type: 'gauge',
                detail: { formatter: '{value}%' },
                data: [{ value: 50, name: '完成率' }]
            }]
        }, true);//true for clear canvas
        chart.resize();
    }
});