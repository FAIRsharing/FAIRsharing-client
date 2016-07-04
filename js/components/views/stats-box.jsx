import React from 'react';
// import chart from 'src/chart.js';
import { ENTITIES_COLOR_MAP, ENTITY_LABELS_PLURAL } from '../../utils/api-constants';
import { Doughnut as DoughnutChart } from 'react-chartjs';

// import _ from 'lodash';

const StatsBox = React.createClass({



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
                }
            };

            plots.push(
                <div key={stat} className="col-xs-12" >
                    <DoughnutChart key={stat} data={dataObj} options={options} height="420px" />
                </div>
            );
            counter++;
        }

        return(<div>{plots}</div>);
    }

});

export default StatsBox;
