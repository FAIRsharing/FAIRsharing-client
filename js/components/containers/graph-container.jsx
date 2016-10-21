/**
* Created by massi on 25/04/2016.
*/
import '../../../styles/graph.scss';
import 'font-awesome/scss/font-awesome.scss';
import React from 'react';
import LayoutForm from '../views/layout-form';
import StatsBox from '../views/stats-box';
import Graph, { Legend } from '../views/graph';
import ModalDialog from '../views/modal-dialog';
import TagsForm from '../views/tags-form';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import * as graphApi from '../../api/graph-api';
// import cytoscape from 'cytoscape';
// import cyCola from 'cytoscape-cola';
// import cola from 'cola';
// import sigma from 'sigma';
import _ from 'lodash';
import GraphHandler from '../../models/graph';
import { ALLOWED_FIELDS } from '../../utils/api-constants';
import * as actions from '../../actions/graph-actions';


// cyCola(cytoscape, cola);
const modalStyles = {overlay: {zIndex: 10}};

class GraphContainer extends React.Component {

    constructor(props) {
        super(props);
    }

    static propTypes = {
        graph: React.PropTypes.shape({
            nodes: React.PropTypes.array.isRequired,
            edges: React.PropTypes.array.isRequired
        }).isRequired,
        layout: React.PropTypes.shape({
            name: React.PropTypes.string,
            visibility: React.PropTypes.object,
            depth: React.PropTypes.number,
            tags: React.PropTypes.object,
            isTagsPanelVisible: React.PropTypes.bool
        }).isRequired,
        isFetching: React.PropTypes.bool,
        reload: React.PropTypes.bool,
        modal: React.PropTypes.shape({
            isOpen: React.PropTypes.bool,
            node: React.PropTypes.string
        }),
        closeDetailsPanel: React.PropTypes.func.isRequired,
        handleLayoutChange: React.PropTypes.func.isRequired,
        visibilityCheckboxChange: React.PropTypes.func.isRequired,
        depthCheckboxChange: React.PropTypes.func.isRequired,
        tagsVisibilityCheckboxChange:React.PropTypes.func.isRequired
    }

    componentDidMount() {
        const graphId = this.props.params.graphId;
        graphApi.getGraph(graphId);
    }

    /*
    shouldComponentUpdate(nextProps, nextState) {
    for (const key in nextProps.layout.visibility) {
    const nextValue = nextProps.layout.visibility[key];
    if (nextValue !== this.props.layout.visibility[key]) {
    this.handler.toggleElementsByLabel(key, nextValue);
    }
    }
    return nextProps.reload;
    },
    */

    render() {
        const { graph, layout, params: { graphId }, reload, error, isFetching, modal } = this.props;
        const collectionName = graph && graph.nodes && graph.nodes[0] && graph.nodes[0].properties.name;
        if (error) {
            return (
                <div className="graph-error">
                    {'An unexpected error occurred while retrieving the graph. Sorry for the inconvenience.' }
                </div>
            );
        }
        const dispatchMethods = {
            openDetailsPanel: this.props.openDetailsPanel,
            closeDetailsPanel: this.props.closeDetailsPanel
        };
        const headerType = !collectionName ? '' : graph.nodes[0].properties.recommendation ? 'Recommendations >' : 'Collections >';

        this.handler = new GraphHandler(graph, layout, dispatchMethods);
        return (
            <div className="graph-container">
                <div className="graph-head">
                    <h3>{`${headerType} ${collectionName || ''}`}</h3>
                </div>
                <div className="graph-handler row">
                    <Modal id="isFetchingModal" isOpen={isFetching} className="is-fetching-modal" style={modalStyles}>
                        <div className="jumbotron jumbotron-icon centred-cnt">
                            <i className="fa fa-spinner fa-spin fa-6 centred-elem" aria-hidden={true}></i>
                        </div>
                    </Modal>
                    <ModalDialog isOpen={modal.isOpen} data={modal.node}
                        allowedFields={ALLOWED_FIELDS} closeDetailsPanel={this.props.closeDetailsPanel} />
                    <div className="col-sm-3 col-xs-6 graph-layout-form-div">
                        <LayoutForm layoutName={layout.name} handleLayoutChange={this.props.handleLayoutChange }
                            visibility={layout.visibility} visibilityCheckboxChange={this.props.visibilityCheckboxChange}
                            // tags={this.props.layout.tags}  tagsSelectChange={this.props.tagsSelectChange}
                            depth={layout.depth} depthCheckboxChange={this.props.depthCheckboxChange}
                            isTagsPanelVisible={layout.isTagsPanelVisible}
                            tagsVisibilityCheckboxChange={this.props.tagsVisibilityCheckboxChange}
                        />
                        <StatsBox handler={this.handler} reload={reload}/>
                        <Legend title='Links Legend'/>
                    </div>
                    <div className="col-sm-9 col-xs-12">
                        <Graph handler={this.handler} layout={layout} reload={reload} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12">
                        <TagsForm isTagsPanelVisible={layout.isTagsPanelVisible} tags={layout.tags}
                            tagsSelectChange={this.props.tagsSelectChange}  />
                    </div>
                </div>
            </div>
        );
    }

}

const mapStateToProps = function(store) {
    const modal = store.graphState.modal;
    const modalNode = modal && modal.isOpen ? _.find(store.graphState.graph.nodes, node => node.properties.application_id === modal.node) : null;
    return {
        graph: store.graphState.graph,
        isFetching: store.graphState.isFetching,
        layout: store.graphState.layout,
        reload: store.graphState.reload,
        modal: {
            isOpen: modal.isOpen,
            node: modalNode
        },
        error: store.graphState.error
    };
};

/**
* @method
* @name mapDispatchToProps
* @param dispatch
* @returns {{handleLayoutChange: (function()), visibilityCheckboxChange: (function())}}
*/
const mapDispatchToProps = function(dispatch) {

    return {

        /**
         * @description sends selected layour to the reducer
         */
        handleLayoutChange: (ev) => {
            dispatch(actions.layoutSelectChange({name: ev.target.value}));
        },

        visibilityCheckboxChange: ev => {
            dispatch(actions.visibilityCheckboxChange({
                entityType: ev.target.dataset.entityType,
                depthLevel: parseInt(ev.target.dataset.depthLevel),
                checked: ev.target.checked
            }));
        },

        depthCheckboxChange: (ev) => {
            dispatch(actions.depthCheckboxChange(ev.target.checked));
        },

        tagsVisibilityCheckboxChange: ev => {
            dispatch(actions.tagsVisibilityCheckboxChange(ev.target.checked));
        },

        tagsSelectChange: (name) => {
            return function(newValue) {
                let selected, unselected;
                //use the clear option to reset the selector, i.e. selecting all options
                if (!newValue) {
                    selected = _.map(this.options, 'value');
                    unselected = [];
                }
                else {
                    selected = _.isArray(newValue) ? _.map(newValue, 'value') : [newValue.value];
                    unselected = _.difference(_.map(this.options, 'value'), selected);
                }
                dispatch(actions.tagsSelectChange({
                    name: name,
                    value: {
                        selected: selected,
                        unselected: unselected
                    }
                }));
            };
        },

        openDetailsPanel: (data) => {
            dispatch(actions.openDetailsPanel(data));
        },

        closeDetailsPanel: () => {
            dispatch(actions.closeDetailsPanel());
        }

    };

};

export default connect(mapStateToProps, mapDispatchToProps)(GraphContainer);
