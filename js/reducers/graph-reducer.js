import * as types from '../actions/action-types';
import { GRAPH_LAYOUTS, BIOSHARING_ENTITIES, TAG_TYPES, DEPTH_LEVELS } from '../utils/api-constants';
import _ from 'lodash';

const visibilityObj = {};
_.values(BIOSHARING_ENTITIES).forEach(entity => visibilityObj[entity.value] = _.zipObject(DEPTH_LEVELS, _.map(DEPTH_LEVELS, () => true)));

const tagSelectorObj = {};
_.values(TAG_TYPES).forEach(tagType => tagSelectorObj[tagType.value] = tagType.initialState);

const initialState = {
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
        depth: 1    // depth of the graph (path length from central node)
    },
    reload: true,
    // state about the modal dialog
    modal: {
        isOpen: false,
        node: null
    }
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

    case types.GET_GRAPH_REQUEST: {
        return {
            ...state,
            isFetching: true
        };
    }

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
            isFetching: false,
            layout: {
                ...state.layout,
                tags: {
                    ...state.layout.tags,
                    ...nextTags
                }
            },
            reload: true
        };
    } // end CASE

    case types.LAYOUT_SELECT_CHANGE:
        return { ...state, layout: { ...state.layout, ...action.layout }, reload: true };

    case types.VISIBILITY_CHECKBOX_CHANGE: {
        for (const key of Object.keys(action.visibility)) {
            action.visibility[key] = Object.assign({}, state.layout.visibility[key], action.visibility[key]);
        }
        return {
            ...state,
            layout: {
                ...state.layout,
                visibility: {
                    ...state.layout.visibility,
                    ...action.visibility
                }
            },
            reload: true
        };
    }

    case types.TAGS_VISIBILITY_CHECKBOX_CHANGE:
        return {
            ...state,
            layout: {
                ...state.layout,
                isTagsPanelVisible: action.isVisible
            },
            reload: false
        };

    case types.DEPTH_CHECKBOX_CHANGE:
        return {
            ...state,
            layout: {
                ...state.layout,
                depth: action.depth
            },
            reload: true
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
    } // end CASE

    case types.OPEN_DETAILS_PANEL:
        return { ...state, modal: { isOpen: true, node: action.nodeId }, reload: false };

    case types.CLOSE_DETAILS_PANEL:
        return { ...state, modal: { isOpen: false, node: null}, reload: false};

    }

    return state;

};

export default graphReducer;
