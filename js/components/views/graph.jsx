/**
* @author massi
*/
import 'rc-slider/assets/index.css';

import React from 'react';
import ReactDOM from 'react-dom';
import Slider from 'rc-slider';
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
 */
const Graph = React.createClass({

    shouldComponentUpdate: function(nextProps) {
        return nextProps.reload;
    },

    componentDidUpdate: function () {
        let graphDOMNode = this.refs.graph;
        this.props.handler.render(graphDOMNode, this.props.layout);
    },

    render: function() {

        const sliders = [], handler = this.props.handler;

        for (const param of handler.getTunableParams()) {
            sliders.push(
                <div key={`div-${param.paramName}`}>
                    <label htmlFor={`slider-${param.paramName}`} className="col-xs-2">
                        {param.paramName}
                    </label>
                    <div className="col-xs-4">
                        <Slider id={`slider-${param.paramName}`} key={param.paramName}
                                defaultValue={param.min} handle={<CustomHandle />}
                                ref={param.paramName} min={param.min} max={param.max}
                                onChange={this._sliderOnChange(param.paramName)} />
                    </div>
                </div>
            );
        }

        return (
            <div id="graphCnt">
                <form className="form">
                    <div className="row">
                        {sliders}
                    </div>
                </form>
                <div className="row">
                    <div id="graph" ref="graph" className="graph col-md-10 col-xs-12"
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
