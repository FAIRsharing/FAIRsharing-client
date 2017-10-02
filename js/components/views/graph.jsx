/**
* @author massi
*/
import 'rc-slider/assets/index.css';

import React, { PropTypes } from 'react';
// import ReactDOM from 'react-dom';
import { Row, Col, Button } from 'react-bootstrap';
import Slider from 'rc-slider';
import GraphHandler from '../../models/graph';
import { ENTITY_SHAPE_MAP, ENTITIES_COLOR_MAP, RELATIONS_COLOR_MAP,
    ENTITY_LABELS_SINGULAR } from '../../utils/api-constants';
import { polygon } from '../../utils/helper-funcs';
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
    value: PropTypes.any,
    offset: PropTypes.number
};

/**
 * @class
 * @name ZoomHandle
 */
export class ZoomHandle extends React.Component {

    static propTypes = {
        value: PropTypes.any,
        offset: PropTypes.number
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
class Graph extends React.Component {

    constructor(props) {
        super(props);
        this._layoutParamOnChange = this._layoutParamOnChange.bind(this);
        this.fitGraph = this.fitGraph.bind(this);
    }

    static propTypes = {
        handler: PropTypes.instanceOf(GraphHandler),
        layout: PropTypes.shape({
            name: PropTypes.string,
            visibility: PropTypes.object,
            depth: PropTypes.number,
            tags: PropTypes.object,
            isTagsPanelVisible: PropTypes.bool
        }).isRequired,
        reload: PropTypes.bool,
        graphStyle: PropTypes.object
    }

    shouldComponentUpdate(nextProps) {
        if (nextProps.reload) {
            const { handler } = this.props;
            handler && handler.destroy();
            return true;
        }
        return false;
    }

    componentDidMount() {
        let graphDOMNode = this.refs.graph;
        this.props.handler.render(graphDOMNode, this.props.layout);
    }

    componentDidUpdate() {
        let graphDOMNode = this.refs.graph, { handler, layout } = this.props;
        // TODO add a spin (waiting) icon here?
        handler.render(graphDOMNode, layout);
        const zoomLevel = handler.zoom();
        const zoomExp = Math.log(zoomLevel)/Math.LN2;
        this.refs.zoomSlider.setState({
            value: zoomExp
        });
    }

    render() {

        const sliders = [], { handler, graphStyle = {} } = this.props, tunableParams = handler.getTunableParams();
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
            <Row className="graph-sliders-div">
                <Col sm={6} xs={8}>
                    <ZoomSlider ref='zoomSlider' handler={handler} />
                </Col>
                <Col sm={2} xs={4}>
                    <Button bsStyle="primary" ref='fitGraph' onClick={this.fitGraph} >Fit & Centre Graph</Button>
                </Col>
            </Row>
            <Row className="graph-sliders-div">
                {sliders}
            </Row>
        </form>;

        return (
            <div id="graphCnt" className="graph-div">
                {sliderForm}
                <Row>
                    <div id="graph" ref="graph" className="graph"
                        style={{
                            ...graphStyle,
                            'height': '100%',
                            'width': '100%'
                        }} >
                    </div>
                </Row>
            </div>
        );
    }

    /**
     * @method
     * @name _layoutParamOnChange
     * @description event handler for layout change
     */
    _layoutParamOnChange(paramName) {
        const handler = this.props.handler;
        return function(paramValue) {
            const params = {};
            params[paramName] = paramValue;
            handler.makeLayout(params);
        };
    }

    /**
     * @method
     * @name fitGraph
     * @description fits and centres the Graph
     */
    fitGraph() {
        const { handler } = this.props;
        handler.fit();
        const zoomLevel = handler.zoom();
        this.refs.zoomSlider.setState({
            value: Math.log(zoomLevel)/Math.LN2
        });

    }

}

/**
 * @class
 * @name Legennd
 * @description a Legend box (fully contained in a canvas)
 */
export class Legend extends React.Component {

    constructor(props) {
        super(props);
        this.draw = this.draw.bind(this);
    }

    componentDidMount() {
        this.draw();
    }

    componentDidUpdate() {
        this.draw();
    }

    /**
     * @method
     * @name draw
     * @description draw the legend canvas
     */
    draw() {
        const { items } = this.props, { graphLegend } = this.refs, context = graphLegend.getContext('2d'),
            nodesShapeMap = ENTITY_SHAPE_MAP, nodesColorMap = ENTITIES_COLOR_MAP, linksMap = RELATIONS_COLOR_MAP,
            radius = 10; //radius of the circumscribed circumference
        const x = 10, xStep = 60, textOffset = 10;
        let y = 25, yStep = 40;
        graphLegend.height = y + (items.length + 1 + 6) * yStep; // a bit heuristic
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
        for (const [entityType, shape] of nodesShapeMap.entries()) {
            if (!entityType) continue;

            context.beginPath();
            switch (shape) {
                case 'triangle':
                    polygon(context, x + xStep/2, y, radius, 3, -Math.PI/2);
                    break;

                case 'diamond':
                    polygon(context, x + xStep/2, y, radius, 4);
                    break;

                case 'hexagon':
                    polygon(context, x + xStep/2, y, radius, 6);
                    break;

                default: //defaults to 'ellipse'
                    context.arc(x + xStep/2, y, radius, 0, 2*Math.PI, false);
            }
            const color = nodesColorMap.get(entityType);
            context.fillStyle = color;
            context.fill();
            context.lineWidth = 3;
            context.strokeStyle = color;
            context.stroke();
            context.fillStyle = 'blue';
            const label = ENTITY_LABELS_SINGULAR[entityType] || entityType;
            context.fillText(label.toUpperCase(), x + xStep + textOffset, y);
            y += yStep;
        }

        for( const [label, color] of linksMap.entries()) {
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
