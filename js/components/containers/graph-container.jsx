/**
 * Created by massi on 25/04/2016.
 */
import React from 'react';
import Graph from '../views/graph';
import { connect } from 'react-redux';
import * as graphApi from '../../api/graph-api';
import store from '../../store';

const NODES_COLOR_MAP = new Map([
    [undefined, 'grey'],
    ['BiosharingCollection', 'red'],
    ['Policy', 'green'],
    ['BioDBCore', 'SteelBlue'],
    ['Standard', 'brown'],
    ['Taxonomy', 'YellowGreen'],
    ['Domain', 'DarkOrange']
]);

const EDGES_COLOR_MAP = new Map([
   [undefined, ''],
    ['RECOMMENDS', 'Teal'],
    ['IMPLEMENTS', 'Coral'],
    ['TAGGED WITH', 'Chartreuse']
]);

class GraphHandler {

    constructor({nodes = [], edges = []}) {
        this._nodes = nodes;
        this._edges = edges;
    }

    get order() {
        return this._nodes && this._nodes.length;
    }

    get size() {
        return this._edges && this._edges.length;
    }

    static get labelColorMap() {
        return LABEL_COLOR_MAP;
    }

    /**
     * prepareElementsToRender
     * @returns {Array}
     */
    prepareElementsForCytoscape() {
        let elements = [];
        for (const node of this._nodes) {
            elements.push({
                group: 'nodes',
                data: {
                    ...node.properties,
                    id: node.properties && node.properties.application_id,
                    label: node.labels && node.labels[0],
                    _color: NODES_COLOR_MAP.get(node.labels && node.labels[0])
                }
            });
        }

        for (const edge of this._edges) {
            elements.push({
                group: 'edges',
                data: {
                    ...edge,
                    _color: EDGES_COLOR_MAP.get(edge.relationship)
                }
            })
        }

        return elements;

    }

}

const GraphContainer = React.createClass({
   
    componentDidMount: function () {
        const graphId = this.props.params.graphId;
        graphApi.getGraph(graphId);
    },
    
    render: function () {
        const graph = new GraphHandler(this.props.graph);
        const elements = graph.prepareElementsForCytoscape();
        return (
            <Graph elements={elements} />
        );        
    }
    
});

const mapStateToProps = function (store) {
    return {
        graph: store.graphState.graph
    };    
};

export default connect(mapStateToProps)(GraphContainer);

