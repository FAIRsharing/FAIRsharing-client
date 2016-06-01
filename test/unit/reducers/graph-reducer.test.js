import { expect } from 'chai';
import graphReducer from '../../../js/reducers/graph-reducer';
import { GRAPH_LAYOUTS, BIOSHARING_ENTITIES, TAG_TYPES } from '../../../js/utils/api-constants';
import _ from 'lodash';
import * as types from '../../../js/actions/action-types';
import * as actions from '../../../js/actions/graph-actions';
import testGraph from '../../fixtures/graph.json';

const visibilityObj = {};
_.values(BIOSHARING_ENTITIES).forEach(entity => visibilityObj[entity.value] = true);

const tagSelectorObj = {};
_.values(TAG_TYPES).forEach(tagType => tagSelectorObj[tagType.value] = tagType.initialState);

describe('graphReducer', () => {

    it('should return the initial state', () => {
        expect(graphReducer(undefined, {})).to.eql({
            graph: {
                nodes: [],
                edges: []
            },
            layout: {
                name: GRAPH_LAYOUTS.COSE,
                visibility: visibilityObj,
                tags: tagSelectorObj,
                depth: 2
            },
            reload: true,
            modal: {
                isOpen: false,
                node: null
            }
        });
    });

    it('should handle the GET_GRAPH_SUCCESS event', () => {
        const nextState = graphReducer(undefined, {
            type: types.GET_GRAPH_SUCCESS,
            graph: testGraph
        });
        const expectedState = {
            graph: testGraph,
            layout: {
                name: GRAPH_LAYOUTS.COSE,
                visibility: visibilityObj,
                depth: 2,
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

    it('should handle the DEPTH_CHECKBOX_CHANGE event', () => {
        const previousState = {
            graph: testGraph,
            layout: {
                name: GRAPH_LAYOUTS.COSE,
                visibility: visibilityObj,
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
            layout: {
                name: GRAPH_LAYOUTS.COSE,
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
            layout: {
                name: GRAPH_LAYOUTS.COSE,
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
        const nextState = graphReducer(previousState, {
            type: types.OPEN_DETAILS_PANEL,
            nodeId: 'biodbcore-000000'
        });
        const expectedState = {
            graph: testGraph,
            layout: {
                name: GRAPH_LAYOUTS.COSE,
                visibility: visibilityObj,
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
            layout: {
                name: GRAPH_LAYOUTS.COSE,
                visibility: visibilityObj,
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
            layout: {
                name: GRAPH_LAYOUTS.COSE,
                visibility: visibilityObj,
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
