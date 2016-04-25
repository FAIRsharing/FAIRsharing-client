/**
 * Created by massi on 25/04/2016.
 */
import React from 'react';
import Graph from '../views/graph';
import { connect } from 'react-redux';
import * as graphApi from '../../api/graph-api';
import store from '../../store';

const GraphContainer = React.createClass({
   
    componentDidMount: function () {
        graphApi.getGraph();
        store.dispatch(/*TODO*/);
    },
    
    render: function () {
        return (
            <Graph graph={this.props.graph} />
        );        
    }
    
});

const mapStateToProps = function (store) {
    return {
        graph: store.graphState.graph
    };    
};

export default connect(mapStateToProps)(GraphContainer);

