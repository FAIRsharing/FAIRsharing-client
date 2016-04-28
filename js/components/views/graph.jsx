/**
 * Created by massi on 25/04/2016.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import cytoscape from 'cytoscape';
import spread from 'cytoscape-spread';
// spread(cytoscape);

const Graph = React.createClass({

    componentDidUpdate: function () {

        let graphCnt = ReactDOM.findDOMNode(this);

        let cy = cytoscape({
            container: graphCnt,

            elements: this.props.elements,

            style: cytoscape.stylesheet()
                .selector('node')
                    .style({
                        'height': 120,
                        'width': 120,
                        'background-color': function (ele) {
                            return ele.data('_color') || 'grey';
                        },
                        'content': function (ele) {
                            if (ele.data('label') === 'BiosharingCollection') {
                                return ele.data('name');
                            }
                            return ele.data('shortname') || ele.data('name').substring(0, 20);
                        },
                        'color': function (ele) {
                            return ele.data('_color') || 'grey';
                        },
                        'font-size': 120,
                        'text-valign': 'center',
                        'text-outline-width': 8,
                        'text-outline-color': 'Black',
                        'border-width': 8,
                        'border-color': 'DimGrey'
                    })

                .selector('edge')
                    .style({
                        'curve-style': 'haystack',
                        'haystack-radius': 0,
                        'width': 8,
                        'line-color': function (ele) {
                            return ele.data('_color') || 'grey';
                        },
                        'target-arrow-color': '#ccc',
                        'target-arrow-shape': 'triangle'
                    }),

            layout: {
                name: 'concentric',
                fit: true,
                padding: 10,
                concentric: function (node) {
                    return node.degree();
                },
                levelWidth: function (nodes) {
                    return 2;
                },
                avoidOverlap: false,
                minNodeSpacing: 5
            }
            /*
            layout: {
                name: 'cose',
                idealEdgeLength: 100,
                nodeOverlap: 5
            } */

        });

        return cy;

    },

    render: function() {
        return <div id="graphDiv" className="graph-cnt"
                    style={{"height": "100%", "width": "100%"}}></div>;
    }

});


export default Graph;