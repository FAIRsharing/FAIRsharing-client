import { expect } from 'chai';
import graphReducer from '../../../js/reducers/graph-reducer';
import { GRAPH_LAYOUTS } from '../../../js/utils/api-constants';
import _ from 'lodash';
import * as types from '../../../js/actions/action-types';
// import * as actions from '../../../js/actions/graph-actions';
import testGraph from '../../fixtures/graph.json';
import { visibilityObj, tagSelectorObj } from '../../test-constants.js';

/*
const visibilityObj = {};
_.values(BIOSHARING_ENTITIES).forEach(entity => visibilityObj[entity.value] = _.zipObject(DEPTH_LEVELS, _.map(DEPTH_LEVELS, () => true)));

const tagSelectorObj = {};
_.values(TAG_TYPES).forEach(tagType => tagSelectorObj[tagType.value] = tagType.initialState);
*/

describe('graphReducer', () => {

    it('should return the initial state', () => {
        expect(graphReducer(undefined, {})).to.eql({
            graph: {
                nodes: [],
                edges: []
            },
            isFetching: false,
            layout: {
                name: GRAPH_LAYOUTS.COSE,
                visibility: visibilityObj,
                isTagsPanelVisible: false,
                tags: tagSelectorObj,
                depth: 1
            },
            reload: true,
            modal: {
                isOpen: false,
                node: null
            }
        });
    });

    it('should handle the GET_GRAPH_REQUEST event', () => {
        const nextState = graphReducer(undefined, {
            type: types.GET_GRAPH_REQUEST
        });
        const expectedState = {
            graph: {
                nodes: [],
                edges: []
            },
            isFetching: true,
            layout: {
                name: GRAPH_LAYOUTS.COSE,
                visibility: visibilityObj,
                isTagsPanelVisible: false,
                tags: tagSelectorObj,
                depth: 1
            },
            reload: true,
            modal: {
                isOpen: false,
                node: null
            }
        };
        expect(nextState).to.eql(expectedState);
    });

    it('should handle the GET_GRAPH_SUCCESS event', () => {
        const previousState = {
            graph: {
                nodes: [],
                edges: []
            },
            isFetching: true,
            layout: {
                name: GRAPH_LAYOUTS.COSE,
                visibility: visibilityObj,
                isTagsPanelVisible: false,
                tags: tagSelectorObj,
                depth: 1
            },
            reload: true,
            modal: {
                isOpen: false,
                node: null
            }
        };
        const nextState = graphReducer(previousState, {
            type: types.GET_GRAPH_SUCCESS,
            graph: testGraph
        });
        const expectedState = {
            graph: testGraph,
            isFetching: false,
            layout: {
                name: GRAPH_LAYOUTS.COSE,
                visibility: visibilityObj,
                isTagsPanelVisible: false,
                depth: 1,
                tags: {
                    domains: {
                        selected: _.union(..._.map(_.map(testGraph.nodes, 'properties'), 'domains')),
                        unselected: []
                    },
                    taxonomies: {
                        selected: _.union(..._.map(_.map(testGraph.nodes, 'properties'), 'taxonomies')),
                        unselected: []
                    }
                }
            },
            reload: true,
            modal: {
                isOpen: false,
                node: null
            }
        };
        expect(nextState).to.eql(expectedState);
    });

    it('should handle the GET_GRAPH_SUCCESS event from a preexisting fetching state', () => {
        const nextState = graphReducer(undefined, {
            type: types.GET_GRAPH_SUCCESS,
            graph: testGraph
        });
        const expectedState = {
            graph: testGraph,
            isFetching: false,
            layout: {
                name: GRAPH_LAYOUTS.COSE,
                visibility: visibilityObj,
                isTagsPanelVisible: false,
                depth: 1,
                tags: {
                    domains: {
                        selected: _.union(..._.map(_.map(testGraph.nodes, 'properties'), 'domains')),
                        unselected: []
                    },
                    taxonomies: {
                        selected: _.union(..._.map(_.map(testGraph.nodes, 'properties'), 'taxonomies')),
                        unselected: []
                    }
                }
            },
            reload: true,
            modal: {
                isOpen: false,
                node: null
            }
        };
        expect(nextState).to.eql(expectedState);
    });

    it('should handle the GET_GRAPH_ERROR event', () => {
        const previousState = {
            graph: {
                nodes: [],
                edges: []
            },
            isFetching: true,
            layout: {
                name: GRAPH_LAYOUTS.COSE,
                visibility: visibilityObj,
                isTagsPanelVisible: false,
                tags: tagSelectorObj,
                depth: 1
            },
            reload: true,
            modal: {
                isOpen: false,
                node: null
            }
        };
        const nextState = graphReducer(previousState, {
            type: types.GET_GRAPH_ERROR,
            error: 'INTERNAL SERVER ERROR'
        });
        const expectedState = {
            graph: {
                nodes: [],
                edges: []
            },
            isFetching: false,
            layout: {
                name: GRAPH_LAYOUTS.COSE,
                visibility: visibilityObj,
                isTagsPanelVisible: false,
                tags: tagSelectorObj,
                depth: 1
            },
            reload: true,
            modal: {
                isOpen: false,
                node: null
            },
            error: 'INTERNAL SERVER ERROR'
        };
        expect(nextState).to.eql(expectedState);
    });

    it('should handle the VISIBILITY_CHECKBOX_CHANGE event, turning Policy at level 1 to false', () => {
        const previousState = {
            graph: testGraph,
            isFetching: false,
            layout: {
                name: GRAPH_LAYOUTS.COSE,
                visibility: {
                    'BioDBCore':{1:true, 2:false},
                    'Policy':{1:true, 2:true},
                    'Standard':{1:true, 2:false}
                },
                isTagsPanelVisible: false,
                tags: tagSelectorObj,
                depth: 1
            },
            reload: true,
            modal: {
                isOpen: false,
                node: null
            }
        };
        const nextState = graphReducer(previousState, {
            type: types.VISIBILITY_CHECKBOX_CHANGE,
            visibility: {
                'Policy': {1: false}
            }
        });

        const expectedState = {
            graph: testGraph,
            isFetching: false,
            layout: {
                name: GRAPH_LAYOUTS.COSE,
                isTagsPanelVisible: false,
                visibility: {
                    'BioDBCore':{1:true, 2:false},
                    'Policy':{1:false, 2:true},
                    'Standard':{1:true, 2:false}
                },
                tags: tagSelectorObj,
                depth: 1
            },
            reload: true,
            modal: {
                isOpen: false,
                node: null
            }
        };
        expect(nextState).to.eql(expectedState);
    });

    it('should handle the DEPTH_CHECKBOX_CHANGE event', () => {
        const previousState = {
            graph: testGraph,
            isFetching: false,
            layout: {
                name: GRAPH_LAYOUTS.COSE,
                visibility: visibilityObj,
                isTagsPanelVisible: true,
                tags: tagSelectorObj,
                depth: 2
            },
            reload: true,
            modal: {
                isOpen: false,
                node: null
            }
        };
        const nextState = graphReducer(previousState, {
            type: types.DEPTH_CHECKBOX_CHANGE,
            depth: 1
        });
        const expectedState = {
            graph: testGraph,
            isFetching: false,
            layout: {
                name: GRAPH_LAYOUTS.COSE,
                isTagsPanelVisible: true,
                visibility: visibilityObj,
                tags: tagSelectorObj,
                depth: 1
            },
            reload: true,
            modal: {
                isOpen: false,
                node: null
            }
        };
        expect(nextState).to.eql(expectedState);
    });

    it('should handle the OPEN_DETAILS_PANEL event', () => {
        const previousState = {
            graph: testGraph,
            isFetching: false,
            layout: {
                name: GRAPH_LAYOUTS.COSE,
                visibility: visibilityObj,
                isTagsPanelVisible: true,
                tags: tagSelectorObj,
                depth: 1
            },
            reload: true,
            modal: {
                isOpen: false,
                node: null
            }
        };
        const nextState = graphReducer(previousState, {
            type: types.OPEN_DETAILS_PANEL,
            nodeId: 'biodbcore-000000'
        });
        const expectedState = {
            graph: testGraph,
            isFetching: false,
            layout: {
                name: GRAPH_LAYOUTS.COSE,
                visibility: visibilityObj,
                isTagsPanelVisible: true,
                tags: tagSelectorObj,
                depth: 1
            },
            reload: false,
            modal: {
                isOpen: true,
                node: 'biodbcore-000000'
            }
        };
        expect(nextState).to.eql(expectedState);
    });

    it('should handle the CLOSE_DETAILS_PANEL event', () => {
        const previousState = {
            graph: testGraph,
            isFetching: false,
            layout: {
                name: GRAPH_LAYOUTS.COSE,
                visibility: visibilityObj,
                isTagsPanelVisible: true,
                tags: tagSelectorObj,
                depth: 1
            },
            reload: true,
            modal: {
                isOpen: true,
                node: 'biodbcore-000000'
            }
        };
        const nextState = graphReducer(previousState, {
            type: types.CLOSE_DETAILS_PANEL
        });
        const expectedState = {
            graph: testGraph,
            isFetching: false,
            layout: {
                name: GRAPH_LAYOUTS.COSE,
                visibility: visibilityObj,
                isTagsPanelVisible: true,
                tags: tagSelectorObj,
                depth: 1
            },
            reload: false,
            modal: {
                isOpen: false,
                node: null
            }
        };
        expect(nextState).to.eql(expectedState);
    });

});
