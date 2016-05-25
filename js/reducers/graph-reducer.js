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
        name: GRAPH_LAYOUTS.COSE,
        visibility: visibilityObj,
        tags: tagSelectorObj
    },
    reload: true
};

/**
* @method
* @name getUniqueTags
* @param nodes
* @return Map - tagMap
* @private
*/
function getUniqueTags(nodes) {
    const tagMap = new Map();
    for (const tagType of _.map(_.values(TAG_TYPES), 'value')) {
        const tags = nodes.map(node => node.properties[tagType]);
        tagMap.set(tagType, _.union(...tags));
    }
    return tagMap;
}

/**
 * @method
 * @name graphReducer
 * @param{Object} state
 * @param{Object} action
 * @return Object - next state
 */
const graphReducer = function (state = initialState, action) {

    switch (action.type) {

    case types.GET_GRAPH_SUCCESS: {
        const tagsMap = getUniqueTags(action.graph.nodes);
        const nextTags = [];
        for (let [key, value] of tagsMap) {
            nextTags[key] = {
                selected: value,
                unselected: []
            };
        }
        return {
            ...state,
            graph: action.graph,
            layout: {
                ...state.layout,
                tags: {
                    ...state.layout.tags,
                    ...nextTags
                }
            },
            reload: true
        };
    }

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

    case types.TAGS_SELECT_CHANGE: {
        // const nextTags = updateTags(action.tags);
        return {
            ...state,
            layout: {
                ...state.layout,
                tags: {
                    ...state.layout.tags,
                    ...action.tags
                }
            },
            reload: true
        };

    }
    }

    return state;

};

export default graphReducer;
