/**
* Created by massi on 25/04/2016.
*/
import React from 'react';
import LayoutForm from '../views/layout-form';
import Graph from '../views/graph';
import ModalDialog from '../views/modal-dialog';
import { connect } from 'react-redux';
import * as graphApi from '../../api/graph-api';
import cytoscape from 'cytoscape';
import cyCola from 'cytoscape-cola';
import cola from 'cola';
import sigma from 'sigma';
import _ from 'lodash';
import { GRAPH_LAYOUTS, BIOSHARING_COLLECTION, ALLOWED_FIELDS } from '../../utils/api-constants';
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

const NODE_SHADOW_DEPTH = Number.POSITIVE_INFINITY;
const EDGE_SHADOW_DEPTH = 2;

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
        // filtering by Tags is not applied to Collections
        if (node.labels.indexOf(BIOSHARING_COLLECTION) >= 0) {
            return true;
        }

        let flag = true;
        for (const tagType of Object.keys(this.tags)) {
            flag = flag &&  _.intersection(node.properties[tagType], this.tags[tagType].selected).length > 0;
        }
        return flag;
    },

    filterByDepth: function(node) {
        return node.path_length <= this.depth;
    },

    filterOutRecommendations: function(node) {
        return !(node.properties.recommendation === true);
    },

    filterOutCollections: function (node) {
        return node.labels.indexOf(BIOSHARING_COLLECTION) < 0 ? true : node.path_length === 0;
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
    nodeRepulsion       : function( node ){ return 4000000; },

    // Node repulsion (overlapping) multiplier
    nodeOverlap         : 100,

    // Ideal edge (non nested) length
    idealEdgeLength     : function( edge ){ return 10; },

    // Divisor to compute edge forces
    edgeElasticity      : function( edge ){ return 100; },

    // Nesting factor (multiplier) to compute ideal edge length for nested edges
    nestingFactor       : 5,

    // Gravity force (constant)
    gravity             : 40,

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
    padding: 1,
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
     * @param{function} openDetailsPanel
     * @param{function} closeDetailsPanel
     * @param{string} layoutName
     */
    constructor({openDetailsPanel = () => {}, closeDetailsPanel = () => {}}, layoutName = GRAPH_LAYOUTS.COSE) {
        super();
        this.layout = layoutName;
        this._cy = null;
        // assing dispatcher methods to object
        this.openDetailsPanel = openDetailsPanel;
        this.closeDetailsPanel = closeDetailsPanel;
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
     *
    _filter_nodes_by_tags(nodes, tags) {
        for (const tagType of Object.keys(tags) ) {
            nodes = nodes.filter(node => {
                return _.intersection(node.properties[tagType], tags[tagType].selected).length > 0;
            });
        }
        return nodes;
    } */

    /**
     * @name _filter_nodes_by_depth
     *
    _filter_nodes_by_depth(nodes, depth = 2) {
        return nodes.filter(node => node.path_length <= depth);
    } */

    /**
    * @method
    * @name _prepareElementsToRender
    * @returns {Array} - the array of annotated elements ready to be displayed on cytoscape
    */
    _prepareElements(nodes, edges) {

        const out_nodes = [], out_edges = [], node_ids = [];
        const rootNode = _.find(nodes, {'path_length': 0});

        for (const node of nodes) {

            if (node_ids.indexOf(node.properties.application_id) > 0) { // remove duplicate nodes (should be already handled on the server)
                continue;
            }

            out_nodes.push({
                group: 'nodes',
                data: {
                    ...node.properties,
                    id: node.properties && node.properties.application_id,
                    label: node.labels && node.labels[0],
                    _color: node.path_length < NODE_SHADOW_DEPTH ? NODES_COLOR_MAP.get(node.labels && node.labels[0]) : NODES_COLOR_MAP.get(undefined),
                    parent: rootNode && node.path_length < NODE_SHADOW_DEPTH ? rootNode.properties.id : null,
                    path_length: node.path_length
                }
            });

            node_ids.push(node.properties.application_id);

        }
        const filtered_node_ids = nodes.map(el => el.properties && el.properties.application_id);

        const filtered_edges = edges.filter(el => filtered_node_ids.indexOf(el.source) > -1 && filtered_node_ids.indexOf(el.target) > -1);

        let source, target, edgeColor, minPathLength, maxPathLength;
        for (const edge of filtered_edges) {

            source = _.find(nodes, {properties: {application_id: edge.source}});
            target = _.find(nodes, {properties: {application_id: edge.target}});
            edgeColor = (target.path_length < EDGE_SHADOW_DEPTH && source.path_length < EDGE_SHADOW_DEPTH) ?
                EDGES_COLOR_MAP.get(edge.relationship) : EDGES_COLOR_MAP.get(undefined);
            minPathLength = Math.min(source.path_length, target.path_length);
            maxPathLength = Math.max(source.path_length, target.path_length);
            out_edges.push({
                group: 'edges',
                data: {
                    ...edge,
                    _color: edgeColor,
                    in_collection: maxPathLength < EDGE_SHADOW_DEPTH,
                    ranking: - minPathLength
                }
            });
        }


        return _.sortBy(out_nodes, node => -node.path_length).concat(_.sortBy(out_edges, 'ranking'));

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

    /**
     * @method
     * @name render
     * @description renders the graph using cytoscape.js
     *
     */
    render(rootEl, layout = {}, nodes = [], edges = []) {

        function scaleNodes(ele) {
            const scaleFactor = ele.data('path_length') === 0 ? 1 : ele.data('path_length');
            return 32/Math.pow(scaleFactor+1, 1);
        }

        function scaleText(ele) {
            // const scaleFactor = ele.data('path_length') === 0 ? 1 : ele.data('path_length');
            const scaleFactor = 1;
            return 20/Math.pow(scaleFactor+1, 1);
        }

        this.layout = layout.name;

        const elements = this._prepareElements(nodes, edges);

        this._cy = cytoscape({
            container: rootEl,

            elements: elements,

            selectionType: 'single',

            style: cytoscape.stylesheet()
            .selector('node')
            .style({
                'height': scaleNodes,
                'width': scaleNodes,
                // colour of the node body
                'background-color': function (ele) {
                    return ele.data('_color') || 'grey';
                },
                'content': function (ele) {
                    if (ele.data('label') === 'BiosharingCollection') {
                        return ele.data('name');
                    }
                    return ele.data('shortname') || ele.data('name');
                },
                // node label (i.e. text element) colour
                'color': function (ele) {
                    return ele.data('path_length') < EDGE_SHADOW_DEPTH ? 'Black' : 'DimGrey';
                    // return ele.data('path_length') < NODE_SHADOW_DEPTH ? 'Black' : ele.data('_color');
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
                // colour of the node border
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

        this._registerNodeEvents();

    }

    _registerNodeEvents() {
        this._cy.on('mouseover', 'node', (event) => {
            const eles = event.cyTarget.closedNeighborhood();
            eles.select();
            this._removed = this._cy.$(':unselected').remove();
            eles.unselect();
        });

        this._cy.on('mouseout', 'node', () => {
            this._removed.restore();
        });

        this._cy.on('click', 'node', (event) => {
            const node = event.cyTarget;
            this.openDetailsPanel(node.data('application_id'));
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
            nodes: _.sortBy(out_nodes, node => -node.path_length),
            edges: _.sortBy(out_edges, edge => -edge.source)
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
     * @param{Obj} graph - properties: nodes{Array}, edges{Array}
     * @param{Obj} layout - properties: name{string}, visibility{Object}, tags{Object}, depth{integer}
     * @param{Obj} dispatchFnc - an object containg methods for dispatch calls to Redux
     */
    constructor({nodes = [], edges = []}, {name = GRAPH_LAYOUTS.COSE, visibility = {}, tags = {}, depth = 2}, dispatchFnc)  {
        this._nodes = nodes;
        this._edges = edges;
        this._layoutName = name;
        this._visibilityMap = visibility;
        this._tags = tags;
        this._depth = depth;
        this._strategy = new CytoscapeStrategy(dispatchFnc);

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
        let filteredNodes = this._nodes;
        for (const filterFnc of Object.keys(nodeFilters)) {
            filteredNodes = filteredNodes.filter(nodeFilters[filterFnc], this);
        }
        this._strategy.render(rootEl, layout, filteredNodes, this._edges);
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
        const dispatchMethods = {
            openDetailsPanel: this.props.openDetailsPanel,
            closeDetailsPanel: this.props.closeDetailsPanel
        };
        this.handler = new GraphHandler(this.props.graph, this.props.layout, dispatchMethods);
        return (
            <div className="row">
                <ModalDialog isOpen={this.props.modal.isOpen} data={this.props.modal.node}
                    allowedFields={ALLOWED_FIELDS} closeDetailsPanel={this.props.closeDetailsPanel} />
                <div className="col-md-3 col-xs-4">
                    <LayoutForm layoutName={this.props.layout.name} handleLayoutChange={this.props.handleLayoutChange }
                        visibility={this.props.layout.visibility} visibilityCheckboxChange={this.props.visibilityCheckboxChange}
                        tags={this.props.layout.tags}  tagsSelectChange={this.props.tagsSelectChange}
                        depth={this.props.layout.depth} depthCheckboxChange={this.props.depthCheckboxChange}
                        isTagsPanelVisible={this.props.layout.isTagsPanelVisible} tagsVisibilityCheckboxChange={this.props.tagsVisibilityCheckboxChange}
                    />
                </div>
                <div className="col-md-9 col-xs-8">
                    <Graph handler={this.handler} layout={this.props.layout} reload={this.props.reload} />
                </div>
            </div>
        );
    }

});

const mapStateToProps = function(store) {
    const modal = store.graphState.modal;
    const modalNode = modal && modal.isOpen ? _.find(store.graphState.graph.nodes, node => node.properties.application_id === modal.node) : null;
    return {
        graph: store.graphState.graph,
        layout: store.graphState.layout,
        reload: store.graphState.reload,
        modal: {
            isOpen: modal.isOpen,
            node: modalNode
        }
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

        tagsVisibilityCheckboxChange: ev => {
            dispatch(actions.tagsVisibilityCheckboxChange(ev.target.checked));
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
        },

        openDetailsPanel: (data) => {
            dispatch(actions.openDetailsPanel(data));
        },

        closeDetailsPanel: () => {
            dispatch(actions.closeDetailsPanel());
        },

    };

};

export default connect(mapStateToProps, mapDispatchToProps)(GraphContainer);
