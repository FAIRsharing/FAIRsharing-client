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
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import { Row, Col, ButtonToolbar, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
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
import { ALLOWED_FIELDS, DEPTH_LEVELS, BIOSHARING_COLLECTION } from '../../utils/api-constants';
import * as actions from '../../actions/graph-actions';


// const modalStyles = {overlay: {zIndex: 10}};

function sortByProperty(objA, objB, propertyKey) {
    const a = objA.hasOwnProperty(propertyKey) && typeof objA[propertyKey] === 'string' ? objA[propertyKey].trim().toUpperCase() : '',
        b = objB.hasOwnProperty(propertyKey) && typeof objB[propertyKey] === 'string' ? objB[propertyKey].trim().toUpperCase() : '';
    if (a > b) {
        return 1;
    }
    if (a < b) {
        return -1;
    }
    return 0;
}

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
        const { graph, layout, reload, modal, graphStyle = null } = this.props;

        const dispatchMethods = {
            openDetailsPanel: this.props.openDetailsPanel,
            closeDetailsPanel: this.props.closeDetailsPanel
        };


        this.handler = new GraphHandler(graph, layout, dispatchMethods);

        return (
            <div className="graph-container container-fluid">
                <Row>
                    <p>The graph is interactive and can be refined via the tags and legend panel on the left hand side.</p>
                </Row>
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
                        <Graph handler={this.handler} layout={layout} reload={reload} graphStyle={graphStyle} />
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

    constructor(props) {
        super(props);
        this._getSelectedTags = this._getSelectedTags.bind(this);
    }

    static propTypes = {
        host: PropTypes.string.isRequired,
        tableStyle: PropTypes.object,
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
            imgAlt: 'deprecated',
            tooltipText: 'This denotes the status of the resource. D = Deprecated'
        },

        RDY: {
            imgURL: 'img/status_circles/ready.png',
            imgAlt: 'ready',
            tooltipText: 'This denotes the status of the resource. R = Ready'
        },
        DEV: {
            imgURL: 'img/status_circles/development.png',
            imgAlt: 'development',
            tooltipText: 'This denotes the status of the resource. DEV = In Development'
        },
        UNC: {
            imgURL: 'img/status_circles/uncertain.png',
            imgAlt: 'uncertain',
            tooltipText: 'This denotes the status of the resource. U = Uncertain'
        }
    }

    _getSelectedTags() {
        const { tags: { domains = {}, taxonomies = {} } = {} } = this.props, selectedTagsList = [];
        const selectedDomains = domains.selected;
        if (selectedDomains.length === 1 && domains.unselected.length > 0) {
            selectedTagsList.push(<li className='bs-bio-tag bs-bio-tag-domain'>{selectedDomains[0]}</li>);
        }
        const selectedTaxonomies = taxonomies.selected;
        if (selectedTaxonomies.length === 1 && taxonomies.unselected.length > 0) {
            selectedTagsList.push(<li className='bs-bio-tag bs-bio-tag-taxonomy'>{selectedTaxonomies[0]}</li>);
        }
        return selectedTagsList.length ? <div style={{height: '16px', width: '100%'}}>
            <ul style={{padding: 0}}>
                {selectedTagsList}
            </ul>
        </div> : null;
    }

    render() {
        const { host, rows, tags = {}, visibility = {}, depth = 1, tagsChange, resetGraph, tableStyle = null } = this.props,
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

        // filter out all the collections
        data = data.filter(datum => datum.labels.indexOf(BIOSHARING_COLLECTION) <= -1);

        const columns = [
            {
                id: 'type',
                Header: 'Type',
                width: 50,
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
                id: 'shortname',
                Header: 'Resource',
                // accessor: 'properties.shortname',
                width: 115,
                accessor: d => {
                    return {
                        shortname: d.properties.shortname,
                        id: d.properties.application_id,
                        url: d.properties.homepage
                    };
                },
                Cell: props => <a href={`${props.value.url}`} target='_blank' rel='noopener noreferrer'>
                    {props.value.shortname}
                </a>,
                sortMethod: (a, b) => sortByProperty(a, b, 'shortname')
                /* {
                    if (a.shortname > b.shortname) {
                        return 1;
                    }
                    if (a.shortname < b.shortname) {
                        return -1;
                    }
                    return 0;
                } */
            },
            {
                id: 'name',
                Header: 'Record',
                width: 225,
                accessor: d => {
                    return {
                        name: d.properties.name,
                        id: d.properties.application_id
                    };
                },
                Cell: props => <a href={`${host}/${props.value.id}/`} target='_blank' rel='noopener noreferrer'>
                    {props.value.name}
                </a>,
                sortMethod: (a, b) => sortByProperty(a, b, 'name')
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
                Header: 'Applicable Species',
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
                width: 60,
                Cell: props => {
                    const obj = statusMap[props.value], tooltip = <Tooltip placement='left'>{obj.tooltipText}</Tooltip>;
                    if (!obj) return null;
                    return <OverlayTrigger placement='left' overlay={tooltip} delayShow={300} delayHide={150}>
                        <img className='bs-bio-status' src={`${host}/static/${obj.imgURL}`} alt={obj.imgAlt} />
                    </OverlayTrigger>;
                }
            }
        ];
        const selectedTags = this._getSelectedTags();

        return <div className='bs-table-box'>
            <div>
                <p>Results can be refined by selecting a domain or species tag.</p>
            </div>
            <div>
                <p className='bs-table-box-count'>{data.length === 1 ? '1 result found.' : `${data.length} results found.`}</p>
                <ButtonToolbar>
                    <Button bsStyle='warning' onClick={resetGraph}>Reset Table</Button>
                </ButtonToolbar>
                {selectedTags}<br />
            </div>
            <div>
                <ReactTable className='-striped -highlight' data={data} columns={columns}
                    defaultSorted={[
                        {
                            id: 'shortname',
                            desc: false
                        }
                    ]}
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
                    style={tableStyle}
                    /* defaultPageSize={} */
                    minRows={data.length < 20 ? data.length : 20}
                />
            </div>
        </div>;
    }

}

class DocumentationContainer extends React.Component {

    render() {
        const { host = '' } = this.props;
        return <div className='bs-widget-documentation'>
            <h3>FAIRsharing Widget Documentation</h3>
            This widget exposes a collection or recommendation from <a href={`${host}`} target='_blank' rel='noopener noreferrer'>FAIRsharing</a>.
            These can be viewed either as a table or a networked graph. Changes applied to one view are reflected on the other.
            <h4>Table View</h4>
            Each record is represented by a row in the table. As a default, the records are sorted on their Abbreviation. The order of the resources can be changed
            by clicking on the column headings.
            The first column details the type of record - database, standard or policy. The final column (status) displays whether the resource is ready
            (R - i.e. maintained, ready for use by the community), under development (DEV - the resource is in development and isn't quite ready for use or implementation),
            deprecated (D - the resource is no longer maintained), or status uncertain (U - where we are unsure as to the status of the resource).
            Resources can be filtered clicking on the 'domains' and 'applied species' tags. Only one filter per column can be applied at a time.
            Clicking on the resource name opens the full FAIRsharing resource record in a new window .
            <h4>Graph View</h4>
            This view displays the network of relationships among the resources in the collection or recommendation.
            The resources can be moved around the graph to provide the best view of the data.
            Clicking on a resource brings up some synopsis information, and a link to the full record on FAIRsharing. <br />
            Clicking on 'Show the tags panel' brings up all the domains and species associated with the resources displayed in the graph.
            These can be selected or removed to filter the resources visible in the graph. The resource tick boxes can be used to filter out resource types.
            As a default, only the resources mentioned in a collection or recommendation are displayed. Clicking on the 'outer' option results in all the resources that are
            related to those in the recommendation, be they standards that are implemented by the databases in the recommendation, or other related databases,
            being displayed in grey as an outer ring. The graph can be displayed using a force-field (COSE) or circular (COLA) layout. The COSE layout is the default.
            For more information on the recommendation, or the resources therein, please see the <a href={`${host}`} target='_blank' rel='noopener noreferrer'>FAIRsharing</a> website.
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
        tableStyle: PropTypes.object,
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

        const { host, graph: { nodes = [] } = {}, layout: { depth = 2, tags = {}, visibility = {} }, isFetching, error, tagsChange, resetGraph, tableStyle } = this.props;
        const collectionName = nodes && nodes[0] && nodes[0].properties.name,
            collectionId = nodes && nodes[0] && nodes[0].properties.bsg_id;
        const headerType = !collectionName ? '' : nodes[0].properties.recommendation ? 'Recommendations' : 'Collections';
        // const headerLink = !collectionName ? '' : nodes[0].properties.recommendation ? '/recommendations' : '/collections';

        if (isFetching) {
            return <div className="jumbotron jumbotron-icon centred-cnt">
                <i className="fa fa-spinner fa-spin fa-6 centred-elem" aria-hidden={true}></i>
            </div>;
        }

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

                {/*
                <Modal id="isFetchingModal" isOpen={isFetching} className="is-fetching-modal" style={modalStyles} parentSelector={() =>  ReactDOM.findDOMNode(this)}>
                    <div className="jumbotron jumbotron-icon centred-cnt">
                        <i className="fa fa-spinner fa-spin fa-6 centred-elem" aria-hidden={true}></i>
                    </div>
                </Modal>
                */}

                <TabList>
                    <Tab>Table</Tab>
                    <Tab>Graph</Tab>
                    <Tab>Documentation</Tab>
                </TabList>

                <TabPanel>
                    <TableBox host={host} tableStyle={tableStyle} rows={nodes} tags={tags} visibility={visibility} depth={depth} tagsChange={tagsChange} resetGraph={resetGraph} />
                </TabPanel>
                <TabPanel>
                    <GraphMainBox {...omit(this.props, ['collectionId', 'host', 'apiKey', 'isFetching', 'error']) } />
                </TabPanel>
                <TabPanel>
                    <DocumentationContainer host={host} />
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
