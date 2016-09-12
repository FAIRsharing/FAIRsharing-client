/**
* @author massi
*/
import 'rc-slider/assets/index.css';

import React from 'react';
import ReactDOM from 'react-dom';
import Slider from 'rc-slider';
import GraphHandler from '../../models/graph';
// import spread from 'cytoscape-spread';

const handleStyle = {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    cursor: 'pointer',
    padding: '2px',
    border: '2px solid #abe2fb',
    borderRadius: '3px',
    background: '#fff',
    fontSize: '14px',
    textAlign: 'center',
    zIndex: 3
};

/**
 * @class
 * @name CustomHandle
 */
const CustomHandle = props => {
    const style = Object.assign({left: props.offset + '%'}, handleStyle);
    return (
        <div style={style}>{props.value}</div>
    );
};

CustomHandle.propTypes = {
    value: React.PropTypes.any,
    offset: React.PropTypes.number
};

/**
 * @class
 * @name Graph
 * @prop{components.containers.GraphHandler} handler
 * @prop{Object} layout
 */
const Graph = React.createClass({

    propTypes: {
        handler: React.PropTypes.instanceOf(GraphHandler),
        layout: React.PropTypes.shape({
            name: React.PropTypes.string,
            visibility: React.PropTypes.object,
            depth: React.PropTypes.number,
            tags: React.PropTypes.object,
            isTagsPanelVisible: React.PropTypes.bool
        }).isRequired,
        reload: React.PropTypes.bool
    },

    shouldComponentUpdate: function(nextProps) {
        return nextProps.reload;
    },

    componentDidMount: function() {
        let graphDOMNode = this.refs.graph;
        this.props.handler.render(graphDOMNode, this.props.layout);
    },

    componentDidUpdate: function() {
        let graphDOMNode = this.refs.graph;
        this.props.handler.render(graphDOMNode, this.props.layout);
    },

    render: function() {

        const sliders = [], handler = this.props.handler, tunableParams = handler.getTunableParams();
        let sliderForm = null;

        if (tunableParams.length > 0) {
            for (const param of tunableParams) {
                sliders.push(
                    <div key={`div-${param.paramName}`}>
                        <label htmlFor={`slider-${param.paramName}`} className="col-xs-2">
                            {param.paramName}
                        </label>
                        <div className="col-xs-4">
                            <Slider id={`slider-${param.paramName}`} key={param.paramName}
                                    defaultValue={(param.min + param.max)/2} handle={<CustomHandle />}
                                    ref={param.paramName} min={param.min} max={param.max}
                                    onChange={this._sliderOnChange(param.paramName)} />
                        </div>
                    </div>
                );
            }
            sliderForm = <form className="form">
                <div className="row graph-sliders-div">
                    {sliders}
                </div>
            </form>;
        }

        return (
            <div id="graphCnt" className="graph-div">
                {sliderForm}
                <div className="row">
                    <div id="graph" ref="graph" className="graph"
                        style={{'height': '100%', 'width': '100%'}} >
                    </div>
                </div>
            </div>
        );
    },

    _sliderOnChange(sliderName) {
        const handler = this.props.handler;
        return function(sliderValue) {
            const params = {};
            params[sliderName] = sliderValue;
            handler.makeLayout(params);
        };
    }

});


export default Graph;
