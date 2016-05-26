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
import * as actions from '../../actions/graph-actions';


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
    ['CONTAINS', '#00cc66'],
    ['RECOMMENDS', 'Teal'],
    ['COLLECTS', '#0099cc'], //blue
    ['IMPLEMENTS', '#99CCFF'],
    ['TAGGED WITH', 'Chartreuse']
]);

const SHADOW_DEPTH = Number.POSITIVE_INFINITY;

export class AbstractGraphStrategy {

    constructor() {
        /* Removed because it threw an error when minifying
        if (new.target === AbstractGraphStrategy) {
        throw new Error("Cannot construct AbstractGraphStrategy instances directly");
        } */
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

/**
 * @description container for all the filter functions for the nodes
 */
export const nodeFilters = {

    /**
     * @description filter out all the nodes that contain at least a label in the blacklist
     */
    filterByLabel: function(node) {
        return _.intersection(node.labels, this.blacklistedLabels).length === 0;
    },

    filterByTags: function(node) {
        let flag = true;
        for (const tagType of Object.keys(this.tags)) {
            flag = flag && _.intersection(node.properties[tagType], this.tags[tagType].selected).length > 0;
        }
        return flag;
    },

    filterByDepth: function(node) {
        return node.path_length <= this.depth;
    },

    filterOutRecommendations: function(node) {
        return !(node.properties.recommendation === true);
    }

};

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
export class CytoscapeStrategy extends AbstractGraphStrategy {

    /**
    * @constructor
    * @param layoutName
    */
    constructor(layoutName = GRAPH_LAYOUTS.COLA) {
        super();
        this.layout = layoutName;
        this._cy = null;
        // this._tagsMap = new Map();
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
     * @name _filter_nodes_by_tags
     */
    _filter_nodes_by_tags(nodes, tags) {
        for (const tagType of Object.keys(tags) ) {
            nodes = nodes.filter(node => {
                return _.intersection(node.properties[tagType], tags[tagType].selected).length > 0;
            });
        }
        return nodes;
    }

    /**
     * @name _filter_nodes_by_depth
     */
    _filter_nodes_by_depth(nodes, depth = 2) {
        return nodes.filter(node => node.path_length <= depth);
    }

    /**
    * @method
    * @name _prepareElementsToRender
    * @returns {Array} - the array of annotated elements ready to be displayed on cytoscape
    */
    _prepareElements(nodes, edges, visibilityMap, tags, depth) {
        const elements = [], node_ids = [];

        const rootNode = _.find(nodes, {'path_length': 0});
        const forbiddenNodes = [];
        Object.keys(visibilityMap).forEach(key => {
            if (!visibilityMap[key]) {
                forbiddenNodes.push(key);
            }
        });
        forbiddenNodes.push(...TAG_NODES);

        // filter the noeds by the allowed entity types (stored as labels)
        let filtered_nodes = nodes.filter(el => forbiddenNodes.indexOf(el.labels && el.labels[0]) < 0);

        // filter the nodes by the allowed tags;
        filtered_nodes = this._filter_nodes_by_tags(filtered_nodes, tags);

        filtered_nodes = this._filter_nodes_by_depth(filtered_nodes, depth);

        filtered_nodes = filtered_nodes.sort((el1, el2) => el1.path_length - el2.path_length);

        for (const node of filtered_nodes) {

            if (node_ids.indexOf(node.properties.application_id) > 0) { // remove duplicate nodes (should be already handled on the server)
                continue;
            }
            if (node.properties.recommendation) // This was added to remove recommendation nodes
            {
                filtered_nodes.splice(filtered_nodes.indexOf(node), 1);
                continue;
            }

            elements.push({
                group: 'nodes',
                data: {
                    ...node.properties,
                    id: node.properties && node.properties.application_id,
                    label: node.labels && node.labels[0],
                    _color: node.path_length < SHADOW_DEPTH ? NODES_COLOR_MAP.get(node.labels && node.labels[0]) : NODES_COLOR_MAP.get(undefined),
                    parent: node.path_length < SHADOW_DEPTH ? rootNode.properties.id : null,
                    path_length: node.path_length
                }
            });

            node_ids.push(node.properties.application_id);

        }
        const filtered_node_ids = filtered_nodes.map(el => el.properties && el.properties.application_id);

        // this._tagsMap = this._get_unique_tags(filtered_nodes);

        const filtered_edges = edges.filter(el => filtered_node_ids.indexOf(el.source) > -1 && filtered_node_ids.indexOf(el.target) > -1);

        let source, target, edge_color;
        for (const edge of filtered_edges) {

            source = _.find(filtered_nodes, {properties: {application_id: edge.source}});
            target = _.find(filtered_nodes, {properties: {application_id: edge.target}});
            edge_color = (target.path_length < SHADOW_DEPTH && source.path_length < 2) ?
            EDGES_COLOR_MAP.get(edge.relationship) : EDGES_COLOR_MAP.get(undefined);

            elements.push({
                group: 'edges',
                data: {
                    ...edge,
                    _color: edge_color,
                    in_collection: target.path_length < 2
                }
            });
        }

        return elements;

    }

    /**
    * @method
    * @name toggleElementsByLabel
    * @param label - string
    * @param remove - boolean: states whether the subgraph elements should be added or removed
    */
    toggleElementsByLabel(label, remove = true) {

        if (remove) {
            let removed = this._cy.nodes().filter((i, ele) => ele.data('label') === label).remove();
            removed = removed.union(removed.connectedEdges());
            this._removed.set(label, removed);
        }
        // restore previously removed elements, if any
        else if (this._removed.has(label)) {
            this._removed.get(label).restore();
            this._removed.delete(label);
        }
    }

    render(rootEl, layout = {}, nodes, edges, tags, depth) {

        function scaleNodes(ele) {
            const scaleFactor = ele.data('path_length') === 0 ? 1 : ele.data('path_length');
            return 32/Math.pow(scaleFactor+1, 1);
        }

        function scaleText(ele) {
            const scaleFactor = ele.data('path_length') === 0 ? 1 : ele.data('path_length');
            return 20/Math.pow(scaleFactor+1, 1);
        }

        this.layout = layout.name;

        const elements = this._prepareElements(nodes, edges, layout.visibility, tags, depth);

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
                    // return ele.data('_color') || 'grey';
                    return ele.data('path_length') < 2 ? 'Black' : ele.data('_color');
                },
                'font-size': scaleText,
                'text-valign': 'center',
                'text-outline-width': function(ele) {
                    // return ele.data('path_length') < 2 ? 2 : 1;
                    return 0;
                },
                'text-outline-color': function (ele) {
                    return ele.data('path_length') < 2 ? 'DimGrey' : 'DarkGrey';
                    // return 'Black';
                },
                'border-width': function(ele) {
                    // return ele.data('path_length') < 2 ? 2 : 1;
                    return 0;
                },
                'border-color': function (ele) {
                    return ele.data('path_length') < 2 ? 'DimGrey' : 'LightGrey';
                    // return 'Grey';
                },
                'text-halign': 'right'
            })

            .selector('edge')
            .style({
                'curve-style': 'haystack',
                'haystack-radius': 0,
                'width': function(ele) {
                    return ele.data('in_collection') ? 2 : 1;
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
        // const node_occurrencies = _.countBy(out_node_ids);

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
export class GraphHandler {

    /**
     * @constructor
     */
    constructor({nodes = [], edges = []}, {name, visibility, tags = {}, depth = 2})  {
        this._nodes = nodes;
        this._edges = edges;
        this._layoutName = name;
        this._visibilityMap = visibility;
        this._tags = tags;
        this._depth = depth;
        this._strategy = new CytoscapeStrategy();

        this._blacklistedLabels = [];
        Object.keys(this._visibilityMap).forEach(key => {
            if (!this._visibilityMap[key]) {
                this._blacklistedLabels.push(key);
            }
        });
        this._blacklistedLabels.push(...TAG_NODES);
    }

    get strategy() {
        return this._strategy;
    }

    set strategy(strategy) {
        if (strategy instanceof AbstractGraphStrategy) {
            this._strategy = strategy;
        }
    }

    get order() {
        return this._nodes && this._nodes.length;
    }

    get size() {
        return this._edges && this._edges.length;
    }

    get layoutName() {
        return this._layoutName;
    }

    get blacklistedLabels() {
        return this._blacklistedLabels;
    }

    get nodes() {
        return this._nodes;
    }

    get tags() {
        return this._tags;
    }

    get depth() {
        return this._depth;
    }

    render(rootEl, layout) {

        this._strategy.render(rootEl, layout, this._nodes, this._edges, this._tags, this._depth);
    }

    toggleElementsByLabel(label, remove) {
        this._strategy.toggleElementsByLabel(label, remove);
    }

}

const GraphContainer = React.createClass({

    componentDidMount: function() {
        const graphId = this.props.params.graphId;
        graphApi.getGraph(graphId);
    },

    /*
    shouldComponentUpdate(nextProps, nextState) {
    for (const key in nextProps.layout.visibility) {
    const nextValue = nextProps.layout.visibility[key];
    if (nextValue !== this.props.layout.visibility[key]) {
    this.handler.toggleElementsByLabel(key, nextValue);
    }
    }
    return nextProps.reload;
    },
    */

    render: function() {
        this.handler = new GraphHandler(this.props.graph, this.props.layout);

        return (
            <Graph handler={this.handler} layout={this.props.layout}
                handleLayoutChange={this.props.handleLayoutChange}
                visibilityCheckboxChange={this.props.visibilityCheckboxChange}
                tagsSelectChange={this.props.tagsSelectChange}
                depthCheckboxChange={this.props.depthCheckboxChange} />
        );
    }

});

const mapStateToProps = function(store) {
    return {
        graph: store.graphState.graph,
        layout: store.graphState.layout,
        reload: store.graphState.reload
    };
};

/**
* @method
* @name mapDispatchToProps
* @param dispatch
* @returns {{handleLayoutChange: (function()), visibilityCheckboxChange: (function())}}
*/
const mapDispatchToProps = function(dispatch) {

    return {

        /**
         * @description sends selected layour to the reducer
         */
        handleLayoutChange: (ev) => {
            dispatch(actions.layoutSelectChange({name: ev.target.value}));
        },

        visibilityCheckboxChange: (ev) => {
            dispatch(actions.visibilityCheckboxChange({
                value: ev.target.value,
                checked: ev.target.checked
            }));
        },

        depthCheckboxChange: (ev) => {
            dispatch(actions.depthCheckboxChange(ev.target.checked));
        },

        tagsSelectChange: (name) => {
            return function(newValue) {
                const selected = _.isArray(newValue) ? _.map(newValue, 'value') : [newValue.value];
                const unselected = _.difference(_.map(this.options, 'value'), selected);
                dispatch(actions.tagsSelectChange({
                    name: name,
                    value: {
                        selected: selected,
                        unselected: unselected
                    }
                }));
            };
        }

    };

};

export default connect(mapStateToProps, mapDispatchToProps)(GraphContainer);
