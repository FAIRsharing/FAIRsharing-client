import * as types from '../actions/action-types';
import { GRAPH_LAYOUTS, BIOSHARING_ENTITIES, TAG_TYPES } from '../utils/api-constants';
import _ from 'lodash';

const visibilityObj = {};
_.values(BIOSHARING_ENTITIES).forEach(entity => visibilityObj[entity.value] = true);

const tagSelectorObj = {};
_.values(TAG_TYPES).forEach(tagType => tagSelectorObj[tagType.value] = tagType.initialState);

const initialState = {
    graph: {
        nodes: [],
        edges: []
    },
    layout: {
        name: GRAPH_LAYOUTS.COLA,
        visibility: visibilityObj,
        tags: tagSelectorObj
    },
    reload: true
};

const graphReducer = function (state = initialState, action) {

    switch (action.type) {

        case types.GET_GRAPH_SUCCESS:
            return { ...state, graph: action.graph, reload: true };
        
        case types.LAYOUT_SELECT_CHANGE:
            return { ...state, layout: { ...state.layout, ...action.layout }, reload: true };

        case types.VISIBILITY_CHECKBOX_CHANGE:
            return { 
                ...state, 
                layout: { 
                    ...state.layout, 
                    visibility: {
                        ...state.layout.visibility,
                        ...action.visibility
                    }
                },
                reload: false
            };

    }

    return state;

};

export default graphReducer;