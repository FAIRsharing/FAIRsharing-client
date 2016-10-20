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
 * @name ZoomHandle
 */
const ZoomHandle = props => {
    const zoomingFactor = Math.trunc(100 * Math.pow(2, props.value));
    const style = Object.assign({left: props.offset + '%'}, handleStyle);
    if (zoomingFactor >= 1000) {
        style.fontSize = '12px';
        style.width = '50px';
    }
    return (
        <div style={style}>{`${zoomingFactor} %`}</div>
    );
};

ZoomHandle.propTypes = {
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
        if (nextProps.reload) {
            const { handler } = this.props;
            handler && handler.destroy();
            return true;
        }
        return false;
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

        // if (tunableParams.length > 0) {
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
                                onChange={this._layoutParamOnChange(param.paramName)} />
                    </div>
                </div>
            );
        }
        sliderForm = <form className="form">
            <div className="row graph-sliders-div">
                <div key={'div-zoom'}>
                    <label htmlFor={'slider-zoom'} className="col-md-1 col-xs-2">Zoom</label>
                    <div className="col-xs-6">
                        <Slider id={'slider-zoom'} key="zoom" ref="zoom"
                                defaultValue={0} min={-3} max={5} step={0.1}
                                handle={<ZoomHandle />} onChange={this._zoomOnChange()} />
                    </div>
                </div>
            </div>
            <div className="row graph-sliders-div">
                {sliders}
            </div>
        </form>;
        //}

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

    _layoutParamOnChange(paramName) {
        const handler = this.props.handler;
        return function(paramValue) {
            const params = {};
            params[paramName] = paramValue;
            handler.makeLayout(params);
        };
    },

    _zoomOnChange() {
        const handler = this.props.handler;
        return function(zoomExp) {
            const zoomLevel = Math.pow(2, zoomExp);
            handler.zoom(zoomLevel);
        };
    }

});


export default Graph;
