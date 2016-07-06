import React from 'react';
// import chart from 'src/chart.js';
import { ENTITIES_COLOR_MAP, ENTITY_LABELS_PLURAL } from '../../utils/api-constants';



import { Doughnut as DoughnutChart } from 'react-chartjs';

/**
 * @method
 * @param{Chart.types.Doughnut} chart - a Chart.js doughnut chart instance
 */
function addLabels(chart) {
    // const chartArea = chart.chartArea, opts = chart.options;
    const config = chart.config, ctx = chart.chart.ctx;
    ctx.fillStyle = '#00008b';
    for (const dataset of config.data.datasets) {
        let total = 0, labelXY = [], offset = Math.PI/2, radius, centreX, centreY, lastEnd = 0;

        for (const val of dataset.data) { total += val; }

        let i = -1, meta, element;
        do {
            meta = dataset._meta[++i];
        }
        while (!meta);

        for (let index = 0; index < meta.data.length; index++) {
            element = meta.data[index];
            radius = 0.9 * element._view.outerRadius - element._view.innerRadius;
            centreX = element._model.x;
            centreY = element._model.y;
            const thisPart = dataset.data[index], arcSector = 2 * Math.PI * (thisPart / total);
            if (element.hasValue() && dataset.data[index] > 0) {
                labelXY.push(lastEnd + arcSector /2 + Math.PI + offset);
            }
            else {
                labelXY.push(-1);
            }
            lastEnd += arcSector;
        }

        let lRadius = 3/4 * radius;
        for (const idXY in labelXY) {
            if (labelXY[idXY] === -1) continue;
            const lAngle = labelXY[idXY],
                dX = centreX + lRadius * Math.cos(lAngle),
                dY = centreY + lRadius * Math.sin(lAngle);
            ctx.fillText(config.data.labels[idXY], dX, dY);
        }
        ctx.restore();
        return true;
    }

}

const StatsBox = React.createClass({

    /*
    componentDidUpdate: function() {
        for (const ref of Object.keys(this.refs)) {
            if (this.refs[ref] instanceof DoughnutChart) {
                const chart = this.refs[ref].getChart();
                this._addLabels(chart);
            }
        }
    }, */

    render: function() {

        const stats = this.props.handler.computeStats();

        const plots = [];
        let counter = 0;

        for (const stat of Object.keys(stats)) {
            const labels = [], data = [], backgroundColors = [];
            for (const entityType of Object.keys(stats[stat])) {
                labels.push(ENTITY_LABELS_PLURAL[entityType]);
                data.push(stats[stat][entityType]);
                backgroundColors.push(ENTITIES_COLOR_MAP.get(entityType));
            }

            const dataObj = {
                labels: labels,
                datasets: [
                    {
                        data: data,
                        backgroundColor: backgroundColors
                    }
                ]
            };

            const options = {
                cutOutPercentage: 55,
                title: {
                    display: true,
                    text: stat
                },
                animation: {
                    onComplete: function() {
                        addLabels(this);
                    }
                }
            };

            plots.push(
                <div key={stat + 'Div'} className="col-xs-12" >
                    <DoughnutChart key={stat} ref={stat} data={dataObj} options={options} height="420px" />
                </div>
            );
            counter++;
        }

        return(<div>{plots}</div>);
    }

});

export default StatsBox;
