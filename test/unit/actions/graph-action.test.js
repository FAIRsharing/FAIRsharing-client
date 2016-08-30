import { expect } from 'chai';

import * as types from '../../../js/actions/action-types';
import * as actions from '../../../js/actions/graph-actions';
import { GRAPH_LAYOUTS, BIOSHARING_ENTITIES } from '../../../js/utils/api-constants';

describe('graph-actions', () => {

    describe('getGraphRequest', () => {
        it('should create an action to notify that is fetching the graph remotely', () => {
            const expectedAction = {
                type: types.GET_GRAPH_REQUEST
            };
            expect(actions.getGraphRequest()).to.eql(expectedAction);
        });
    });

    describe('getGraphSuccess', () => {
        it('should create an action to instantiate a new graph', () => {
            const graph = {};
            const expectedAction = {
                type: types.GET_GRAPH_SUCCESS,
                graph
            };
            expect(actions.getGraphSuccess(graph)).to.eql(expectedAction);
        });
    });

    describe('layoutSelectChange', () => {
        it('should create an action to change the graph layout', () => {
            const layout = {
                name: GRAPH_LAYOUTS.COSE
            };
            const expectedAction = {
                type: types.LAYOUT_SELECT_CHANGE,
                layout
            };
            expect(actions.layoutSelectChange(layout)).to.eql(expectedAction);
        });
    });

    describe('visibilityCheckboxChange', () => {
        it('should create an action to change the entity allowed to be visible in the graph', () => {
            const checkboxState = {
                entityType: 'ENTITY',
                depthLevel: 1,
                checked: false
            };
            const visibility = {
                'ENTITY': {
                    1: false
                }
            };
            const expectedAction = {
                type: types.VISIBILITY_CHECKBOX_CHANGE,
                visibility
            };
            expect(actions.visibilityCheckboxChange(checkboxState)).to.eql(expectedAction);
        });
    });

    describe('depthCheckboxChange', () => {
        it('should create an action to change the depth of the graph to 2', () => {
            const checkboxState = true;
            const depth = 2;
            const expectedAction = {
                type: types.DEPTH_CHECKBOX_CHANGE,
                depth
            };
            expect(actions.depthCheckboxChange(checkboxState)).to.eql(expectedAction);
        });

        it('should create an action to change the depth of the graph to 2', () => {
            const checkboxState = false;
            const depth = 1;
            const expectedAction = {
                type: types.DEPTH_CHECKBOX_CHANGE,
                depth
            };
            expect(actions.depthCheckboxChange(checkboxState)).to.eql(expectedAction);
        });
    });

    describe('tagSelectChange', () => {
        it('it should create an action to add/remove one or more tag of a given type', () => {
            const selectState = {
                name: 'domains',
                value: {
                    selected: ['Edain', 'Noldor', 'Tatyar'],
                    unselected: ['Vanyar', 'Lindar']
                }
            };
            const tags = {
                'domains': {
                    selected: ['Edain', 'Noldor', 'Tatyar'],
                    unselected: ['Vanyar', 'Lindar']
                }
            };
            const expectedAction = {
                type: types.TAGS_SELECT_CHANGE,
                tags
            };
            expect(actions.tagsSelectChange(selectState)).to.eql(expectedAction);
        });
    });

});
