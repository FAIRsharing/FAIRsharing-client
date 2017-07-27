/**
* Created by massi on 25/04/2016.
*/
import 'bootstrap-loader';
import '../../../styles/graph.scss';
import '../../../styles/biosharing-entities.scss';
import 'font-awesome/scss/font-awesome.scss';
import 'react-tabs/style/react-tabs.scss';
import 'react-table/react-table.css';

import React, { PropTypes } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import { Row, Col, ButtonToolbar, Button } from 'react-bootstrap';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ReactTable from 'react-table';
// import FontAwesome from 'react-fontawesome';


import { getGraphWidget } from '../../api/graph-api';
import LayoutForm from '../views/layout-form';
import StatsBox from '../views/stats-box';
import Graph, { Legend } from '../views/graph';
import ModalDialog from '../views/modal-dialog';
import TagsForm from '../views/tags-form';

import { find, isArray, difference, map, uniq, omit, isEqual, zipObject, cloneDeep, merge } from 'lodash';
import GraphHandler, { nodeFilters } from '../../models/graph';
import { ALLOWED_FIELDS, DEPTH_LEVELS } from '../../utils/api-constants';
import * as actions from '../../actions/graph-actions';


const modalStyles = {overlay: {zIndex: 10}};

/**
 * @class
 * @name GraphMainBox
 * @extends React.Component
 * @description container class for the Graph visualizer
 * @prop{Object} graph - containing an array of nodes and an array of edges
 * @prop{Object} layout - describes the layout used to display the graph, and which parts of the graph are actually shown (to be refactored?)
 */
export class GraphMainBox extends React.Component {

    static propTypes = {
        // collectionId: PropTypes.string.isRequired,
        // host: PropTypes.string.isRequired,
        // apiKey: PropTypes.string.isRequired,
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

    shouldComponentUpdate(nextProps) {
        const hasChanged = isEqual(nextProps, this.props);
        return !hasChanged;
    }

    /**
     * @method
     * @description standard React.Component method. It is executed anytime the state of the application (as stored in Redux) is modified by an action.
     */
    render() {
        const { graph, layout, reload, modal } = this.props;

        const dispatchMethods = {
            openDetailsPanel: this.props.openDetailsPanel,
            closeDetailsPanel: this.props.closeDetailsPanel
        };


        this.handler = new GraphHandler(graph, layout, dispatchMethods);

        return (
            <div className="graph-container container-fluid">

                <Row className="graph-handler">

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
 * @class
 * @name TableBox
 * @extends React.Component
 * @description main component for the table view of the graph data
 */
export class TableBox extends React.Component {

    static propTypes = {
        host: PropTypes.string.isRequired,
        rows: PropTypes.array.isRequired,
        depth: PropTypes.number,
        tags: PropTypes.object,
        visibility: PropTypes.object,
        tagsChange: PropTypes.func.isRequired,
        resetGraph: PropTypes.func.isRequired
    }

    static repositoryMap = {
        'BioDBCore': {
            imgURL: 'img/icons/db-icon.png',
            imgAlt: 'datatabase',
            title: 'Database'
        },
        'reporting guideline': {
            imgURL: 'img/icons/reporting_guidelines.png',
            imgAlt: 'reporting guideline',
            title: 'Reporting Guideline'
        },
        'model/format': {
            imgURL: 'img/icons/model_and_format.png',
            imgAlt: 'model/format',
            title: 'Model/Format'
        },
        'terminology artifact': {
            imgURL: 'img/icons/terminology_artifact.png',
            imgAlt: 'terminology artifact',
            title: 'Terminology Artifact'
        },
        'Policy': {
            imgURL: 'img/icons/policy.png',
            imgAlt: 'policy',
            title: 'Policy'
        },
        'BiosharingCollection': {
            imgURL: 'img/icons/policy.png',
            imgAlt: 'FAIRsharing collection',
            title: 'FAIRsharing Collection'
        }
    }

    static statusMap = {
        DEP: {
            imgURL: 'img/status_circles/deprecated.png',
            imgAlt: 'deprecated'
        },

        RDY: {
            imgURL: 'img/status_circles/ready.png',
            imgAlt: 'ready'
        },
        DEV: {
            imgURL: 'img/status_circles/development.png',
            imgAlt: 'development'
        },
        UNC: {
            imgURL: 'img/status_circles/uncertain.png',
            imgAlt: 'uncertain'
        }
    }

    render() {
        const { host, rows, tags = {}, visibility = {}, depth = 1, tagsChange, resetGraph } = this.props,
            { statusMap, repositoryMap } = this.constructor;
            // collectionName = rows && rows[0] && rows[0].properties.name;
        let data = cloneDeep(rows);

        // prepare blacklistedLabels: initialize an array of empty objects for each depth level of the graph
        const blacklistedLabels = zipObject(DEPTH_LEVELS, map(DEPTH_LEVELS, () => []));

        for (const entityType of Object.keys(visibility)) {
            for (const depthLevel of DEPTH_LEVELS) {
                if (!visibility[entityType][depthLevel]) {
                    blacklistedLabels[depthLevel].push(entityType);
                }
            }
        }

        for (const filterFnc of Object.keys(nodeFilters)) {
            data = data.filter(nodeFilters[filterFnc], {
                tags: tags,
                depth: depth,
                blacklistedLabels: blacklistedLabels
            });
        }

        const columns = [
            {
                id: 'type',
                Header: 'Type',
                accessor: d => {
                    return {
                        type: d.labels && d.labels[0],
                        subType: d.properties && d.properties.type
                    };
                },
                Cell: props => {
                    const { type, subType } = props.value,
                        repo = type === 'Standard' ? repositoryMap[subType] : repositoryMap[type];
                    return <img className='bs-bio-repository' src={`${host}/static/${repo.imgURL}`}
                        alt={repo.imgAlt} title={repo.title}
                    />;
                }
            },
            {
                id: 'name',
                Header: 'Name',
                accessor: d => {
                    return {
                        name: d.properties.name,
                        id: d.properties.application_id
                    };
                },
                Cell: props => <a href={`${host}/${props.value.id}/`} target='_blank' rel='noopener noreferrer'>
                    {props.value.name}
                </a>
            },
            {
                Header: 'Abbreviation',
                accessor: 'properties.shortname'
            },
            /*
            {
                id: 'type',
                header: 'Type',
                accessor: d => {
                    const type = d.labels && d.labels[0], subType = d.properties && d.properties.type;
                    return subType || repositoryMap[type].title;
                },

            }, */
            {
                Header: 'Domains',
                accessor: 'properties.domains',
                Cell: props => <ul>
                    {props.value.map(el => <li className='bs-bio-tag bs-bio-tag-domain'>
                        {/* <FontAwesome name='tag' className='fa-fw' /> */}
                        <a onClick={ev => {
                            const name = ev.target.innerHTML;
                            const selected = [name], allTags = merge(tags.domains.selected, tags.domains.unselected);
                            const unselected = difference(allTags, selected);
                            tagsChange('domains', selected, unselected);
                        }}>{el}</a>
                    </li>)}
                </ul>

            },
            {
                Header: 'Taxonomies',
                accessor: 'properties.taxonomies',
                Cell: props => <ul className='bs-bio-tags'>
                    {props.value.map(el => <li className='bs-bio-tag bs-bio-tag-taxonomy'>
                        {/* <FontAwesome name='tag' className='fa-fw' /> */}
                        <a onClick={ev => {
                            const name = ev.target.innerHTML;
                            const selected = [name], allTags = merge(tags.taxonomies.selected, tags.taxonomies.unselected);
                            const unselected = difference(allTags, selected);
                            tagsChange('taxonomies', selected, unselected);
                        }}>{el}</a>
                    </li>)}
                </ul>
            },
            {
                Header: 'Status',
                accessor: 'properties.status',
                Cell: props => {
                    const obj = statusMap[props.value];
                    if (!obj) return null;
                    return <img className='bs-bio-status' src={`${host}/static/${obj.imgURL}`} alt={obj.imgAlt} />;
                }
            }
        ];


        return <div className='bs-table-box'>
            <div>
                <p className='bs-table-box-count'>{data.length === 1 ? '1 result found.' : `${data.length} results found.`}</p>
                <ButtonToolbar>
                    <Button bsStyle='warning' onClick={resetGraph}>Reset Table</Button>
                </ButtonToolbar>
            </div>
            <div>
                <ReactTable className='-striped -highlight' data={data} columns={columns}
                    getTheadProps={() => {
                        return {
                            style: {
                                'backgroundColor': '#e6EEEE',
                                'color': 'black',
                                'border': '1px solid #fff',
                                'fontWeight': 'bold'
                            }
                        };
                    }}
                    /* defaultPageSize={} */
                    minRows={data.length < 20 ? data.length : 20}
                />
            </div>
        </div>;
    }

}

/**
 * @class
 * @name CollectionWidgetContainer
 * @extends React.Component
 * @description container class for the Graph visualizer
 * @prop{Object} graph - containing an array of nodes and an array of edges
 * @prop{Object} layout - describes the layout used to display the graph, and which parts of the graph are actually shown (to be refactored?)
 */
class CollectionWidgetContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            tabIndex: 0
        };
    }

    componentDidMount() {
        const { collectionId, host, apiKey } = this.props;
        getGraphWidget(collectionId, host, apiKey);
    }

    static propTypes = {
        collectionId: PropTypes.string.isRequired,
        host: PropTypes.string.isRequired,
        apiKey: PropTypes.string.isRequired,
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
        tagsSelectChange: PropTypes.func.isRequired,
        tagsChange: PropTypes.func.isRequired,
        resetGraph: PropTypes.func.isRequired
    }

    render() {

        const { host, graph: { nodes = [] } = {}, layout: { depth = 2, tags = {}, visibility = {} }, isFetching, error, tagsChange, resetGraph } = this.props;
        const collectionName = nodes && nodes[0] && nodes[0].properties.name,
            collectionId = nodes && nodes[0] && nodes[0].properties.bsg_id;
        const headerType = !collectionName ? '' : nodes[0].properties.recommendation ? 'Recommendations' : 'Collections';
        // const headerLink = !collectionName ? '' : nodes[0].properties.recommendation ? '/recommendations' : '/collections';

        if (error) {
            // console.log(error);
            return (
                <div className="graph-error">
                    {'An unexpected error occurred while retrieving the graph. Sorry for the inconvenience.' }
                </div>
            );
        }

        return <div className="bs-container">
            <div className="bs-head">
                <span>
                    {/* <a href={headerLink}>{`${headerType} `}</a> */}
                    {`${headerType} >`}
                    <a href={`${host}/${collectionId}`} target='_blank' rel='noopener noreferrer' >
                        {` ${collectionName || ''}`}
                    </a>
                </span>
                <div className='float-right'>
                    <img src={`${host}/static/img/home/svg/FAIRsharing-sdp.svg`} height='60' />
                </div>
            </div>
            <Tabs selectedIndex={this.state.tabIndex} onSelect={tabIndex => this.setState({ tabIndex })} >

                <Modal id="isFetchingModal" isOpen={isFetching} className="is-fetching-modal" style={modalStyles}>
                    <div className="jumbotron jumbotron-icon centred-cnt">
                        <i className="fa fa-spinner fa-spin fa-6 centred-elem" aria-hidden={true}></i>
                    </div>
                </Modal>

                <TabList>
                    <Tab>Table</Tab>
                    <Tab>Graph</Tab>
                </TabList>

                <TabPanel>
                    <TableBox host={host} rows={nodes} tags={tags} visibility={visibility} depth={depth} tagsChange={tagsChange} resetGraph={resetGraph} />
                </TabPanel>
                <TabPanel>
                    <GraphMainBox {...omit(this.props, ['collectionId', 'host', 'apiKey', 'isFetching', 'error']) } />
                </TabPanel>
            </Tabs>
        </div>;

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
    const modal = store.modal;
    const modalNode = modal && modal.isOpen ? find(store.graph.nodes, node => node.properties.application_id === modal.node) : null;
    return {
        graph: store.graph,
        isFetching: store.isFetching,
        layout: store.layout,
        reload: store.reload,
        modal: {
            isOpen: modal.isOpen,
            node: modalNode
        },
        error: store.error
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
        handleLayoutChange: ev => {
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
         * @name tagsChange
         * @param{String} name
         * @param{Array} selectedTags
         * @param{Array} unselectedTags
         * @description handles the change in state of checkbox toggling the Tags Select boxes.
         *              If checked the Tags Select boxes will be visible, otherwise are hidden.
         */
        tagsChange: (name, selectedTags, unselectedTags) => {
            dispatch(actions.tagsSelectChange({
                name: name,
                value: {
                    selected: selectedTags,
                    unselected: unselectedTags
                }
            }));
        },

        /**
         * @method
         * @name tagsSelectChange
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
        },

        resetGraph: () => {
            dispatch(actions.resetGraph());
        }

    };

};

export default connect(mapStateToProps, mapDispatchToProps)(CollectionWidgetContainer);
