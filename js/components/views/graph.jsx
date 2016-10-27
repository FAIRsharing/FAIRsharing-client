/**
* @author massi
*/
import 'rc-slider/assets/index.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { Col } from 'react-bootstrap';
import Slider from 'rc-slider';
import GraphHandler from '../../models/graph';
import { RELATIONS_COLOR_MAP } from '../../utils/api-constants';
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
export class ZoomHandle extends React.Component {

    static propTypes = {
        value: React.PropTypes.any,
        offset: React.PropTypes.number
    }

    render() {
        const { value, offset } = this.props;
        const zoomingFactor = Math.trunc(100 * Math.pow(2, value));
        const style = Object.assign({left: offset + '%'}, handleStyle);
        if (zoomingFactor >= 1000) {
            style.fontSize = '12px';
            style.width = '50px';
        }
        return (
            <div style={style}>{`${zoomingFactor} %`}</div>
        );
    }

}

/**
 * @class
 * @name ZoomSlider
 */
export class ZoomSlider extends React.Component {

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.state = {
            value: 0,
            min: -3,
            max: 5
        };
    }

    onChange(zoomExp) {
        const { handler } = this.props;
        const zoomLevel = Math.pow(2, zoomExp);
        handler.zoom(zoomLevel);
        this.setState({
            value: zoomExp
        });
    }

    render() {
        const {value, min, max} = this.state;
        return (<div key={'div-zoom'}>
            <label htmlFor={'slider-zoom'} className="col-md-1 col-xs-2">Zoom</label>
            <div className="col-xs-6">
                <Slider id={'slider-zoom'} key="zoom" ref="zoom"
                        value={value} min={min} max={max} step={0.1}
                        handle={<ZoomHandle />} onChange={this.onChange} />
            </div>
        </div>);
    }

}

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
        let graphDOMNode = this.refs.graph, { handler, layout } = this.props;
        // TODO add a spin (waiting) icon here?
        handler.render(graphDOMNode, layout);
        const zoomExp = handler.zoom();
        //const zoomExp = Math.log(zoom)/Math.LN2;
        this.refs.zoomSlider.setState({
            zoom: zoomExp
        });
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
                <ZoomSlider ref='zoomSlider' handler={handler} />
                { /*
                <div key={'div-zoom'}>
                    <label htmlFor={'slider-zoom'} className="col-md-1 col-xs-2">Zoom</label>
                    <div className="col-xs-6">
                        <Slider id={'slider-zoom'} key="zoom" ref="zoom"
                                defaultValue={0} min={-3} max={5} step={0.1}
                                handle={<ZoomHandle />} onChange={this._zoomOnChange()} />
                    </div>
                </div>
                */ }
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

/**
 * @class
 * @name Legennd
 * @description a Legend box (fully contained in a canvas)
 */
export class Legend extends React.Component {

    constructor(props) {
        super(props);
    }

    /**
     * @description draw the legend canvas
     */
    componentDidUpdate() {
        const { items } = this.props, { graphLegend } = this.refs, context = graphLegend.getContext('2d'), legendMap = RELATIONS_COLOR_MAP;
        let x = 10, y = 25;
        const xStep = 60, yStep = 20, textOffset = 10;
        graphLegend.height = y + (items.length + 1) * yStep; // a bit heuristic
        context.clearRect(0, 0, graphLegend.width, graphLegend.height);
        context.font = '16px Sans-Serif';
        context.fillStyle = '#27aae1';
        context.textAlign = 'center';
        context.textBaseline = 'alphabetic';
        context.fillText(this.props.title, graphLegend.width/2, y);
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.font = '11px Sans-Serif';
        context.fillStyle = 'grey';
        y += yStep;
        for ( const [label, color] of legendMap.entries()) {
            if (!label || items.indexOf(label) < 0) {
                continue;
            }
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + xStep, y);
            context.lineWidth = 3;
            context.strokeStyle = color;
            context.stroke();
            context.fillText(label, x + xStep + textOffset, y);
            y += yStep;
        }
    }

    render() {
        return (<Col xs={12} id="graphLegendCnt" >
            <div className="graph-legend">
                <canvas id='graph-legend' ref='graphLegend' ></canvas>
            </div>
        </Col>);
    }
}

export default Graph;
