import React from 'react';
import { values, find } from 'lodash';
import { Col } from 'react-bootstrap';
// import chart from 'src/chart.js';
import { BIOSHARING_ENTITIES, ENTITIES_COLOR_MAP, ENTITY_LABELS_PLURAL } from '../../utils/api-constants';



import { Doughnut as DoughnutChart } from 'react-chartjs';


function compareEntityTypeByRank(firstType, secondType) {
    const entitiesArr = values(BIOSHARING_ENTITIES);
    return find(entitiesArr, ['value', secondType]).rank - find(entitiesArr, ['value', firstType]).rank ;
}

/**
 * @method
 * @param{Chart.types.Doughnut} chart - a Chart.js doughnut chart instance
 */
function addLabels(chart) {
    // const chartArea = chart.chartArea, opts = chart.options;
    const config = chart.config, ctx = chart.chart.ctx;
    ctx.fillStyle = '#00008b';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
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
            // radius = 0.9 * element._view.outerRadius - element._view.innerRadius;
            radius = element._view.outerRadius;
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
        // ctx.fillText('*', centreX, centreY);
        let lRadius = 3/4 * radius;
        for (const idXY in labelXY) {
            if (labelXY[idXY] === -1) continue;
            const lAngle = labelXY[idXY],
                dX = centreX + lRadius * Math.cos(lAngle),
                dY = centreY + lRadius * Math.sin(lAngle);
            // ctx.fillText(config.data.labels[idXY], dX, dY);
            ctx.fillText(dataset.data[idXY], dX, dY);
        }
        ctx.restore();
        return true;
    }

}

const StatsBox = React.createClass({

    shouldComponentUpdate: function(nextProps) {
        return nextProps.reload;
    },

    /*
    componentDidUpdate: function() {
        let legend;
        for (const ref of Object.keys(this.refs)) {
            if (this.refs[ref] instanceof DoughnutChart) {
                // const chart = this.refs[ref].getChart();
                // this._addLabels(chart);
                const chart = this.refs[ref].getChart();
                legend = chart.generateLegend();
            }
        }
        this.refs['doughnutsLegendCnt'].innerHTML = legend;
    }, */

    render: function() {

        const stats = this.props.handler.computeStats();
        const plots = [];
        let counter = 0, statsLegend;

        for (const stat of Object.keys(stats)) {
            const labels = [], data = [], backgroundColors = [];
            for (const entityType of Object.keys(stats[stat]).sort(compareEntityTypeByRank)) {
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
                cutOutPercentage: 65,
                title: {
                    display: true,
                    text: stat
                },
                tooltips: {
                    enabled: false
                },
                animation: {
                    onComplete: function() {
                        addLabels(this);
                    }
                }
            };

            const chartElem = <DoughnutChart key={stat} ref={stat} data={dataObj} options={options}
                width={180} height={240} />;
            plots.push(<div key={stat + 'Div'} className="col-xs-12" >{chartElem}</div>);
            counter++;

        }

        return(
            <Col xs={12} className="stats-box">
                {/* <div id="doughnutsLegendCnt" ref="doughnutsLegendCnt">
                    {statsLegend}
                </div> */}
                <div id="doughnutsCnt">
                    {plots}
                </div>
            </Col>
            );
    }

});

export default StatsBox;
