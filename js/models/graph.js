import cytoscape from 'cytoscape';
import cyCola from 'cytoscape-cola';
import cola from 'cola';
import sigma from 'sigma';
import _ from 'lodash';
import { GRAPH_LAYOUTS, BIOSHARING_COLLECTION, DEPTH_LEVELS, ENTITIES_COLOR_MAP as NODES_COLOR_MAP,
    RELATIONS_COLOR_MAP as EDGES_COLOR_MAP, TAG_ENTITIES as TAG_NODES
} from '../utils/api-constants';


cyCola(cytoscape, cola);

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

/**
 * @constant
 * @description property objects for the various layout types
 */

const basicLayoutProps= {
    fit: true,
    animate: true
};

export const concentricLayoutProps = {
    ...basicLayoutProps,
    name: 'concentric',
    padding: 10,
    concentric: function (node) {
        return node.degree();
    },
    levelWidth: function (nodes) {
        return 10;
    },
    avoidOverlap: false,
    minNodeSpacing: 3
};

export const colaLayoutProps = {
    ...basicLayoutProps,
    name: 'cola',
    nodeSpacing: function() { return 25; },
    edgeLength: 400,
    padding: 1,
    randomize: false,
    maxSimulationTime: 5000
};

export const coseLayoutProps = {
    ...basicLayoutProps,
    name: 'cose',
    // Called on `layoutready`
    ready               : function() {},
    // Called on `layoutstop`
    stop                : function() {},
    // The layout animates only after this many milliseconds
    // (prevents flashing on fast runs)
    animationThreshold  : 250,
    // Number of iterations between consecutive screen positions update
    // (0 -> only updated on the end)
    refresh             : 20,
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
};

/**
 * @constant
 * @name layoutMap
 */
const layoutMap = new Map();

// concentric layout
layoutMap.set('concentric', concentricLayoutProps);

// COSE layout
layoutMap.set('cose', coseLayoutProps);

// COLA layout
layoutMap.set('cola', colaLayoutProps);

/**
 * @description container for all the filter functions for the nodes
 */
export const nodeFilters = {
    /**
     * @description filter out all the nodes that contain at least a label in the blacklist
     * @returns {Boolean}
     */
    filterByLabel: function(node) {
        return _.intersection(node.labels, this.blacklistedLabels[node.path_length]).length === 0;
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
    constructor({openDetailsPanel = () => {}, closeDetailsPanel = () => {}} = {}, layoutName = GRAPH_LAYOUTS.COSE) {
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
     * @method
     * @name makeLayout
     * @description generates a new layout, given the params provided
     * @param{Object} params, containing any of the params allowed in the Cytoscape layouts
     *                (see http://js.cytoscape.org/#layouts)
     */
    makeLayout(params) {
        if (!this._cy) {
            return; // should it throw an Exception?
        }
        this._cyLayout && this._cyLayout.stop();
        const options = layoutMap.get(this._layout && this._layout.name);
        if (params.edgeLength) {
            options.nodeSpacing = function () { return options.nodeSpacingValue; };
        }
        for (const param of Object.keys(params)) {
            options[param] = params[param];
        }
        this._cyLayout = this._cy.makeLayout(options);
        this._cyLayout.run();
    }

    /**
     * @method
     * @name getTunableParams
     * @description return a the list of tunable params with range values for each strategy
     */
    getTunableParams() {
        const layoutName = this._layout && this._layout.name;
        switch (layoutName) {

        case GRAPH_LAYOUTS.COLA:
            return [
                {paramName: 'nodeSpacingValue', min: 1, max: 100},
                {paramName: 'edgeLength', min: 50, max: 500}
            ];
        default:
            return [];
        }
    }

    /**
    * @method
    * @name _prepareElementsToRender
    * @param{Array} nodes
    * @param{Array} edges
    * @returns {Array} - the array of annotated elements ready to be displayed on cytoscape
    * TODO this method
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
    * @description
    */
    toggleElementsByLabel(label, remove = true) {

        if (!this._removed) {
            this._removed = new Map();
        }

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
     * @param{Object} graph, consisting of two properties:
     *              - {Array} nodes
     *              - {Array} edges
     * @param{Object} layout. (for the allowed properties ee http://js.cytoscape.org/#layouts)
     * @param{HTMLElement} rootEl - the container of the graph. If falsy the graph is run headllessly
     */
    render({ nodes = [], edges = []} = {}, layout = {}, rootEl) {

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
        const isHeadless = rootEl ? false : true;

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

            // zooming options
            userZoomingEnabled: false,
            minZoom: 0.25,
            maxZoom: 40,

            // rendering options
            headless: isHeadless

        });

        this._cyLayout = this._cy.makeLayout(this.layout);
        this._cyLayout.start();
        this._registerNodeEvents();

    }

    /**
     * @method
     * @name zoom
     * @description performs the zoom of the graph
     * @param{Number}
     */
    zoom(zoomFactor) {
        const cy = this._cy, container = cy.container();
        const width = container.offsetWidth, height = container.offsetHeight;
        cy.zoom({
            level: zoomFactor,
            renderedPosition: { x: width/2, y: height/2}
        });
    }

    /**
     * @private
     */
    _registerNodeEvents() {
        const cy = this._cy, container = cy.container();
        if (!container) return;

        cy.on('mouseover', 'node', event => {
            // if there were some selected elements from previous operations deselect them
            this._cy.$(':selected').unselect();

            const eles = event.cyTarget.closedNeighborhood();
            eles.select();
            this._removed = this._cy.$(':unselected').remove();
            eles.unselect();
        });

        cy.on('mouseout', 'node', () => {
            this._removed.restore();
        });

        cy.on('click', 'node', event => {
            const node = event.cyTarget;
            this.openDetailsPanel(node.data('application_id'));
        });

        /*
        container.addEventListener('wheel', event => {
            if (event.wheelDelta === 0) {
                return;
            }
            const width = container.offsetWidth, height = container.offsetHeight;
            const zoomingFactor = event.wheelDelta > 0 ? 1.1 : 1/1.1;
            cy.zoom({
                level: zoomingFactor * cy.zoom(),
                renderedPosition: { x: width/2, y: height/2}
            });
            return false;
        }); */
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
export default class GraphHandler {

    /**
     * @constructor
     * @param{Obj} graph - properties: nodes{Array}, edges{Array}
     * @param{Obj} layout - properties: name{string}, visibility{Object}, tags{Object}, depth{integer}
     * @param{Obj} dispatchFnc - an object containg methods for dispatch calls to Redux
     */
    constructor({nodes = [], edges = []} = {}, {name = GRAPH_LAYOUTS.COSE, visibility = {}, tags = {}, depth = 2} = {}, dispatchFnc)  {
        this._nodes = nodes;
        this._edges = edges;
        this._layoutName = name;
        this._visibilityMap = visibility;
        this._tags = tags;
        this._depth = depth;
        this._strategy = new CytoscapeStrategy(dispatchFnc, this._layoutName);

        // initialize an array of empty objects for each depth level of the graph
        this._blacklistedLabels = _.zipObject(DEPTH_LEVELS, _.map(DEPTH_LEVELS, () => []));

        for (const entityType of Object.keys(this._visibilityMap)) {
            for (const depthLevel of DEPTH_LEVELS) {
                if (!this._visibilityMap[entityType][depthLevel]) {
                    this._blacklistedLabels[depthLevel].push(entityType);
                }
            }
        }
        /*
        for (const depthLevel of DEPTH_LEVELS) {
            this._blacklistedLabels[depthLevel].push(...TAG_NODES);
        } */
        for (const filterFnc of Object.keys(nodeFilters)) {
            this._nodes = this._nodes.filter(nodeFilters[filterFnc], this);
        }
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

    makeLayout(params) {
        return this._strategy.makeLayout(params);
    }

    /**
     * @method
     * @name computeStats
     * @description compute the stats by label for the inner and outer part of the item
     * @return{Object}
     */
    computeStats() {
        // console.log(TAG_NODES);
        // console.log(BIOSHARING_COLLECTION);
        if (_.isEmpty(this._nodes)) {
            return {};
        }
        const blacklistedNodes = _.clone(TAG_NODES);
        blacklistedNodes.push(BIOSHARING_COLLECTION);
        const innerVsOuterNodes = _.partition(this._nodes, node => node.path_length <= 1);

        let countByEntityArray = [];
        for (const partition of innerVsOuterNodes) {
            const byEntity = _.groupBy(partition, node => {
                return node.labels && node.labels[0];
            });
            const countByEntity = {};
            for (const entityType of Object.keys(byEntity)) {
                if (blacklistedNodes.indexOf(entityType) < 0) {
                    countByEntity[entityType] = byEntity[entityType].length;
                }
            }
            countByEntityArray.push(countByEntity);
        }

        /*
        const byEntity = _.groupBy(this._nodes, node => {
            return node.labels && node.labels[0];
        });
        let countByEntity = {};
        for (const entityType of Object.keys(byEntity)) {
            if (blacklistedNodes.indexOf(entityType) < 0) {
                countByEntity[entityType] = byEntity[entityType].length;
            }
        } */

        return _.isEmpty(countByEntityArray[1]) ? {
            'Count': countByEntityArray[0]
        } : {
            'Count - Inner': countByEntityArray[0],
            'Count - Outer': countByEntityArray[1],
            'Count - Total': countByEntityArray.reduce((prevObj, currObj) => {
                const nextObj = {};
                for (const property of _.union(Object.keys(prevObj), Object.keys(currObj))) {
                    const curr = currObj[property] || 0;
                    const prev = prevObj[property] || 0;
                    nextObj[property] = curr + prev;
                }
                return nextObj;
            })
        };
    }

    /**
     * @method
     * @name getTunableParams
     * @description return a the list of tunable params with range values for each strategy
     */
    getTunableParams() {
        return this._strategy.getTunableParams();
    }

    render(rootEl, layout) {
        /*
        let filteredNodes = this._nodes;
        for (const filterFnc of Object.keys(nodeFilters)) {
            filteredNodes = filteredNodes.filter(nodeFilters[filterFnc], this);
        }
        this._nodes = filteredNodes;
        */
        const graph = {
            nodes: this._nodes,
            edges: this._edges
        };
        this._strategy.render(graph, layout, rootEl);
    }

    toggleElementsByLabel(label, remove) {
        this._strategy.toggleElementsByLabel(label, remove);
    }

    zoom(level) {
        this._strategy.zoom(level);
    }

}
