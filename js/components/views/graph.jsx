/**
 * Created by massi on 25/04/2016.
 */
import React from 'react';
import ReactDOM from 'react-dom';


// import spread from 'cytoscape-spread';


const Graph = React.createClass({

    componentDidUpdate: function () {

        let graphCnt = ReactDOM.findDOMNode(this);
        this.props.handler.render(graphCnt);

    },

    render: function() {
        return <div id="graphDiv" className="graph-cnt"
                    style={{"height": "100%", "width": "100%"}}>
                </div>;
    }

});


export default Graph;