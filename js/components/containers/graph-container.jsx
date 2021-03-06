/**
* Created by massi on 25/04/2016.
*/
import '../../../styles/graph.scss';
import 'font-awesome/scss/font-awesome.scss';
import React, { PropTypes } from 'react';
import LayoutForm from '../views/layout-form';
import StatsBox from '../views/stats-box';
import Graph, { Legend } from '../views/graph';
import ModalDialog from '../views/modal-dialog';
import TagsForm from '../views/tags-form';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import * as graphApi from '../../api/graph-api';
// import cytoscape from 'cytoscape';
// import cyCola from 'cytoscape-cola';
// import cola from 'cola';
// import sigma from 'sigma';
import { find, isArray, difference, map, uniq } from 'lodash';
import GraphHandler from '../../models/graph';
import { ALLOWED_FIELDS } from '../../utils/api-constants';
import * as actions from '../../actions/graph-actions';


// cyCola(cytoscape, cola);
const modalStyles = {overlay: {zIndex: 10}};

/**
 * @class
 * @extends React.Component
 * @description container class for the Graph visualizer
 * @prop{Object} graph - containing an array of nodes and an array of edges
 * @prop{Object} layout - describes the layout used to display the graph, and which parts of the graph are actually shown (to be refactored?)
 */
export class GraphContainer extends React.Component {

    constructor(props) {
        super(props);
    }

    static propTypes = {
        graph: PropTypes.shape({
            nodes: PropTypes.array.isRequired,
            edges: PropTypes.array.isRequired
        }).isRequired,
        layout: PropTypes.shape({
            name: PropTypes.string,
            visibility: PropTypes.object,
            depth: PropTypes.number,
            tags: PropTypes.object,
            isTagsPanelVisible: PropTypes.bool
        }).isRequired,
        isFetching: PropTypes.bool,
        reload: PropTypes.bool,
        modal: PropTypes.shape({
            isOpen: PropTypes.bool,
            node: PropTypes.string
        }),
        closeDetailsPanel: PropTypes.func.isRequired,
        handleLayoutChange: PropTypes.func.isRequired,
        visibilityCheckboxChange: PropTypes.func.isRequired,
        depthCheckboxChange: PropTypes.func.isRequired,
        tagsVisibilityCheckboxChange:PropTypes.func.isRequired,
        tagsSelectChange: PropTypes.func.isRequired
    }

    componentDidMount() {
        const { match: { params: { graphId } = {} } = {} } = this.props;
        graphApi.getGraph(graphId);
    }

    /**
     * @method
     * @description standard React.Component method. It is executed anytime the state of the application (as stored in Redux) is modified by an action.
     */
    render() {
        const { graph, layout, reload, error, isFetching, modal } = this.props;
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
        const headerType = !collectionName ? '' : graph.nodes[0].properties.recommendation ? 'Recommendations' : 'Collections';
        const headerLink = !collectionName ? '' : graph.nodes[0].properties.recommendation ? '/recommendations' : '/collections';

        this.handler = new GraphHandler(graph, layout, dispatchMethods);

        return (
            <div className="graph-container container-fluid">
                <div className="graph-head">
                    <h3>{'Graph Viewer: '}
                        <a href={headerLink}>{`${headerType} `}</a>
                        {`> ${collectionName || ''}`}
                    </h3>
                </div>
                <Row className="graph-handler">
                    <Modal id="isFetchingModal" isOpen={isFetching} className="is-fetching-modal" style={modalStyles}>
                        <div className="jumbotron jumbotron-icon centred-cnt">
                            <i className="fa fa-spinner fa-spin fa-6 centred-elem" aria-hidden={true}></i>
                        </div>
                    </Modal>
                    <ModalDialog isOpen={modal.isOpen} data={modal.node}
                        allowedFields={ALLOWED_FIELDS} closeDetailsPanel={this.props.closeDetailsPanel} />
                    <Col sm={3} xs={6} className="graph-layout-form-div">
                        <Row>
                            <LayoutForm layoutName={layout.name} handleLayoutChange={this.props.handleLayoutChange }
                                visibility={layout.visibility} visibilityCheckboxChange={this.props.visibilityCheckboxChange}
                                // tags={this.props.layout.tags}  tagsSelectChange={this.props.tagsSelectChange}
                                depth={layout.depth} depthCheckboxChange={this.props.depthCheckboxChange}
                                isTagsPanelVisible={layout.isTagsPanelVisible}
                                tagsVisibilityCheckboxChange={this.props.tagsVisibilityCheckboxChange}
                            />
                            <StatsBox handler={this.handler} reload={reload}/>
                            <Legend title='Legend' items={uniq(map(this.handler.edges, 'relationship'))} />
                        </Row>
                    </Col>
                    <Col sm={9} xs={12} >
                        <Graph handler={this.handler} layout={layout} reload={reload} />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <TagsForm isTagsPanelVisible={layout.isTagsPanelVisible} tags={layout.tags}
                            tagsSelectChange={this.props.tagsSelectChange}  />
                    </Col>
                </Row>
            </div>
        );
    }

}

/**
 * @method
 * @name mapStateToProps
 * @description maps certain parts of the state (as stored in Redux) to properties of the GraphContainer class.
 *              Everytime the state is altered the properties are overwritten
 * @param{Object} store - the Redux store
 * @return{Object} all the mapped properties
 */
const mapStateToProps = function(store) {
    const modal = store.graphState.modal;
    const modalNode = modal && modal.isOpen ? find(store.graphState.graph.nodes, node => node.properties.application_id === modal.node) : null;
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
* @description maps a number of functions used to dispatch actions for the Reduce to the props of the GraphContainer class
* @returns Object {{handleLayoutChange: (function()), visibilityCheckboxChange: (function())}}
*/
const mapDispatchToProps = function(dispatch) {

    return {

        /**
         * @description sends selected layour to the reducer
         */
        handleLayoutChange: (ev) => {
            dispatch(actions.layoutSelectChange({name: ev.target.value}));
        },

        /**
         * @method
         * @name visibilityCheckboxChange
         * @description handles the change in state of a visibility checkbox triggering the action that updates the store
         *              for the corresponding entityType (e.g. database, standard...), depth level (inner or outer), and the value
         *              of the checkbox itself (CHECKED/UNCHECKED)
         */
        visibilityCheckboxChange: ev => {
            dispatch(actions.visibilityCheckboxChange({
                entityType: ev.target.dataset.entityType,
                depthLevel: parseInt(ev.target.dataset.depthLevel),
                checked: ev.target.checked
            }));
        },

        /**
         * @method
         * @name depthCheckboxChange
         * @description handles the change in state of the depth checkbox. If checked also the outer level of the graph should be visible, otherwise
         *              only the inner layer is shown
         */
        depthCheckboxChange: ev => {
            dispatch(actions.depthCheckboxChange(ev.target.checked));
        },

        /**
         * @method
         * @name tagsVisibilityCheckboxChange
         * @description handles the change in state of checkbox toggling the Tags Select boxes.
         *              If checked the Tags Select boxes will be visible, otherwise are hidden.
         */
        tagsVisibilityCheckboxChange: ev => {
            dispatch(actions.tagsVisibilityCheckboxChange(ev.target.checked));
        },

        /**
         * @method
         * @name tagsVisibilityCheckboxChange
         * @description handles the change in state of checkbox toggling the Tags Select boxes.
         *              If checked the Tags Select boxes will be visible, otherwise are hidden.
         */
        tagsSelectChange: name => {
            return function(newValue) {
                let selected, unselected;
                //use the clear option to reset the selector, i.e. selecting all options
                if (!newValue) {
                    selected = map(this.options, 'value');
                    unselected = [];
                }
                else {
                    selected = isArray(newValue) ? map(newValue, 'value') : [newValue.value];
                    unselected = difference(map(this.options, 'value'), selected);
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

        openDetailsPanel: data => {
            dispatch(actions.openDetailsPanel(data));
        },

        closeDetailsPanel: () => {
            dispatch(actions.closeDetailsPanel());
        }

    };

};

export default connect(mapStateToProps, mapDispatchToProps)(GraphContainer);
