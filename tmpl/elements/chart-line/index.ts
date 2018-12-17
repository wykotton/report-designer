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
            title: {
                text: props.title
            },
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                data: [1, 2, 3, 4, 5]
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: [120, 300, 400, 220, 40],
                type: 'line'
            }, {
                data: [90, 200, 600, 100, 50],
                type: 'line'
            }]
        }, true);//true for clear canvas
        chart.resize();
    }
});