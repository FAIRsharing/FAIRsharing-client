/**
 * Created by massi on 25/04/2016.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import LayoutForm from './layout-form';

// import spread from 'cytoscape-spread';


const Graph = React.createClass({

    componentDidUpdate: function () {
        let graphDOMNode = this.refs.graph;
        this.props.handler.render(graphDOMNode, this.props.layout.name);
    },

    render: function() {
        return (
            <div id="graphCnt">
                <LayoutForm layoutName={this.props.layout.name} />
                <div id="graph" ref="graph" className="graph" style={{"height": "100%", "width": "100%"}}></div>
            </div>
        );
    }

});


export default Graph;