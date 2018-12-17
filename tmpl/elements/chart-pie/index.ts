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
                text: props.title,
                x: 'center'
            },
            series: [{
                data: [{ value: 120, name: 'pie1' },
                { vaue: 300, name: 'pie2' },
                { value: 400, name: 'pie3' },
                { value: 220, name: 'pie4' },
                { value: 40, name: 'pie5' }],
                type: 'pie',
                name: 'test'
            }]
        }, true);//true for clear canvas
        chart.resize();
    }
});