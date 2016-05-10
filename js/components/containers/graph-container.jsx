/**
 * Created by massi on 25/04/2016.
 */
import React from 'react';
import Graph from '../views/graph';
import { connect } from 'react-redux';
import * as graphApi from '../../api/graph-api';
import cytoscape from 'cytoscape';
import cyCola from 'cytoscape-cola';
import cola from 'cola';
import sigma from 'sigma';
import _ from 'lodash';
import { GRAPH_LAYOUTS } from '../../utils/api-constants';
import store from '../../store';

cyCola(cytoscape, cola);

const TAG_NODES = ['Taxonomy', 'Domain'];

const NODES_COLOR_MAP = new Map([
    [undefined, '#d9d9d9'],
    ['BiosharingCollection', '#ff4000'], //red
    ['Policy', '#9cf76e'],    //green
    ['BioDBCore', '#e67300'], //orange/ocre
    ['Standard', '#d4d413'],  // azure
    ['Taxonomy', 'YellowGreen'],
    ['Domain', 'DarkOrange']
]);

const EDGES_COLOR_MAP = new Map([
    [undefined, '#d9d9d9'],
    ['RECOMMENDS', 'Teal'],
    ['COLLECTS', '#0099cc'], //blue
    ['IMPLEMENTS', '#99CCFF'],
    ['TAGGED WITH', 'Chartreuse']
]);

class AbstractGraphStrategy {

    constructor() {
        if (new.target === AbstractGraphStrategy) {
            throw new Error("Cannot construct AbstractGraphStrategy instances directly");
        }
    }

    render(rootEl, nodes, edges) {
        throw new Error('Method not implemented!');
    }
}

const layoutMap = new Map();
// concentric layout
layoutMap.set('concentric', {
    name: 'concentric',
    fit: true,
    padding: 10,
    concentric: function (node) {
        return node.degree();
    },
    levelWidth: function (nodes) {
        return 10;
    },
    avoidOverlap: false,
    minNodeSpacing: 5
});

// COSE layout
layoutMap.set('cose', {
    name: 'cose',
     // Called on `layoutready`
     ready               : function() {},

     // Called on `layoutstop`
     stop                : function() {},

     // Whether to animate while running the layout
     animate             : true,

     // The layout animates only after this many milliseconds
     // (prevents flashing on fast runs)
     animationThreshold  : 250,

     // Number of iterations between consecutive screen positions update
     // (0 -> only updated on the end)
     refresh             : 20,

     // Whether to fit the network view after when done
     fit                 : true,

     // Padding on fit
     padding             : 30,

     // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
     boundingBox         : undefined,

     // Extra spacing between components in non-compound graphs
     componentSpacing    : 100,

     // Node repulsion (non overlapping) multiplier
     nodeRepulsion       : function( node ){ return 400000; },

     // Node repulsion (overlapping) multiplier
     nodeOverlap         : 100,

     // Ideal edge (non nested) length
     idealEdgeLength     : function( edge ){ return 10; },

     // Divisor to compute edge forces
     edgeElasticity      : function( edge ){ return 100; },

     // Nesting factor (multiplier) to compute ideal edge length for nested edges
     nestingFactor       : 5,

     // Gravity force (constant)
     gravity             : 80,

     // Maximum number of iterations to perform
     numIter             : 1000,

     // Initial temperature (maximum node displacement)
     initialTemp         : 200,

     // Cooling factor (how the temperature is reduced between consecutive iterations
     coolingFactor       : 0.95,

     // Lower temperature threshold (below this point the layout will end)
     minTemp             : 1.0,

     // Whether to use threading to speed up the layout
     useMultitasking     : true

});

// COLA layout
layoutMap.set('cola', {
    name: 'cola',
    nodeSpacing: 50,
    edgeLengthVal: 10,
    padding:10,
    animate: true,
    randomize: false,
    fit: true,
    maxSimulationTime: 5000
});

/**
 * @class
 * @name CytoscapeStrategy
 * @description strategy class to format and render graphs with the cytoscape.js library
 */
class CytoscapeStrategy extends AbstractGraphStrategy {

    /**
     * @constructor
     * @param layoutName
     */
    constructor(layoutName = GRAPH_LAYOUTS.COLA) {
        super();
        this.layout = layoutName;
    }

    get layout() {
        return this._layout;
    }

    set layout(layoutName) {
        const layout = layoutMap.get(layoutName);
        if (layout !== undefined) {
            this._layout = layout;
        }
    }

    /**
     * @method
     * @name prepareElementsToRender
     * @returns {Array} - the array of annotated elements ready to be displayed on cytoscape
     */
    _prepareElements(nodes, edges) {
        const elements = [], node_ids = [];

        const rootNode = _.find(nodes, {'path_length': 0});

        let filtered_nodes = nodes.filter(el => TAG_NODES.indexOf(el.labels && el.labels[0]) < 0);
        filtered_nodes = filtered_nodes.sort((el1, el2) => el1.path_length - el2.path_length);


        for (const node of filtered_nodes) {

            if (node_ids.indexOf(node.properties.application_id) > 0) {
                continue;
            }

            elements.push({
                group: 'nodes',
                data: {
                    ...node.properties,
                    id: node.properties && node.properties.application_id,
                    label: node.labels && node.labels[0],
                    _color: node.path_length < 2 ? NODES_COLOR_MAP.get(node.labels && node.labels[0]) : NODES_COLOR_MAP.get(undefined),
                    parent: node.path_length < 2 ? rootNode.properties.id : null,
                    path_length: node.path_length
                }
            });

            node_ids.push(node.properties.application_id);

        }
        const filtered_node_ids = filtered_nodes.map(el => el.properties && el.properties.application_id);
        const filtered_edges = edges.filter(el => filtered_node_ids.indexOf(el.source) > -1 && filtered_node_ids.indexOf(el.target) > -1);

        let source, target, edge_color;
        for (const edge of filtered_edges) {

            source = _.find(filtered_nodes, {properties: {application_id: edge.source}});
            target = _.find(filtered_nodes, {properties: {application_id: edge.target}});
            console.log(target);
            edge_color = (target.path_length < 2 && source.path_length < 2) ?
                EDGES_COLOR_MAP.get(edge.relationship) : EDGES_COLOR_MAP.get(undefined);

            elements.push({
                group: 'edges',
                data: {
                    ...edge,
                    _color: edge_color,
                    in_collection: target.path_length < 2
                }
            })
        }

        return elements;

    }

    render(rootEl, layout, nodes, edges) {

        function scaleNodes(ele) {
            return 32/Math.pow(ele.data('path_length')+1, 1);
        }

        function scaleText(ele) {
            return 12/Math.pow(ele.data('path_length')+1, 1);
        }

        this.layout = layout;

        const elements = this._prepareElements(nodes, edges);

        this._cy = cytoscape({
            container: rootEl,

            elements: elements,

            style: cytoscape.stylesheet()
                .selector('node')
                .style({
                    'height': scaleNodes,
                    'width': scaleNodes,
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
                    'font-size': scaleText,
                    'text-valign': 'center',
                    'text-outline-width': function(ele) {
                        return ele.data('path_length') < 2 ? 2 : 1;
                        // return 2
                    },
                    'text-outline-color': function (ele) {
                        return ele.data('path_length') < 2 ? 'DimGrey' : 'DarkGrey';
                        // return 'Grey';
                    },
                    'border-width': function(ele) {
                        return ele.data('path_length') < 2 ? 2 : 1;
                        // return 2;
                    },
                    'border-color': function (ele) {
                        return ele.data('path_length') < 2 ? 'DimGrey' : 'LightGrey';
                        // return 'Grey';
                    }
                })

                .selector('edge')
                .style({
                    'curve-style': 'haystack',
                    'haystack-radius': 0,
                    'width': function(ele) {
                        return ele.data('in_collection') ? 2 : 1
                    },
                    'line-color': function (ele) {
                        return ele.data('_color') || 'grey';
                    },
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle'
                }),

            layout: this.layout

        });

    }

}


class SigmaStrategy extends AbstractGraphStrategy {

    constructor() {
        super();
    }


    _prepareElements(in_nodes, in_edges) {

        const filtered_nodes = in_nodes.filter(el => TAG_NODES.indexOf(el.labels && el.labels[0]) < 0);
        const out_nodes = filtered_nodes.map(node => {
            return {
                id: node.properties.application_id,
                label: node.properties.shortName || node.properties.name,
                x: Math.random(),
                y: Math.random(),
                size: 1,
                color: NODES_COLOR_MAP.get(node.labels && node.labels[0])
            };
        });

        const out_node_ids = out_nodes.map(node => node.id);
        const node_occurrencies = _.countBy(out_node_ids);

        const filtered_edges = in_edges.filter(el => out_node_ids.indexOf(el.source) > -1 && out_node_ids.indexOf(el.target) > -1);

        const out_edges = filtered_edges.map((edge, index) => {
            return {
                id: `e${index}`,
                ...edge
            };
        });

        return {
            nodes: out_nodes,
            edges: out_edges
        };



    }

    render(rootEl, layout, nodes = [], edges = []) {
        const graph = this._prepareElements(nodes, edges);
        const s = new sigma({
            container: rootEl.id,
            graph: graph
        });
        return s;
    }

}

/**
 * @class
 * @name GraphHandler
 * @description a utility to handle the layout of the graph
 */
class GraphHandler {

    constructor({nodes = [], edges = []}) {
        this._nodes = nodes;
        this._edges = edges;
        this._strategy = new CytoscapeStrategy();
    }

    get strategy() {
        return this._strategy;
    }

    set strategy(strategy) {
        if (strategy instanceof AbstractGraphStrategy) {
            this._strategy = strategy
        }
    }

    get order() {
        return this._nodes && this._nodes.length;
    }

    get size() {
        return this._edges && this._edges.length;
    }

    render(rootEl, layout) {
        this._strategy.render(rootEl, layout, this._nodes, this._edges);
    }

}

const GraphContainer = React.createClass({

    componentDidMount: function () {
        const graphId = this.props.params.graphId;
        graphApi.getGraph(graphId);
    },

    render: function () {
        const handler = new GraphHandler(this.props.graph);
        return (
            <Graph handler={handler} layout={this.props.layout} />
        );
    }

});

const mapStateToProps = function (store) {
    return {
        graph: store.graphState.graph,
        layout: store.graphState.layout
    };
};

export default connect(mapStateToProps)(GraphContainer);

