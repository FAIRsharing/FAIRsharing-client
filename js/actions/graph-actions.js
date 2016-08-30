import * as types from './action-types';

export function getGraphRequest() {
    return {
        type: types.GET_GRAPH_REQUEST
    };
}

export function  getGraphSuccess(graph) {
    return {
        type: types.GET_GRAPH_SUCCESS,
        graph
    };
}

export function  layoutSelectChange(layout) {
    return {
        type: types.LAYOUT_SELECT_CHANGE,
        layout
    };
}

/**
 * @method
 * @name visibilityCheckboxChange
 * @param{Object} checkboxState
 * @returns {{type, visibility: {}}}
 */
export function visibilityCheckboxChange(checkboxParams) {
    // TODO finish this one!! And tests
    const visibility = {};
    visibility[checkboxParams.entityType] = { };
    visibility[checkboxParams.entityType][checkboxParams.depthLevel] = checkboxParams.checked;
    return {
        type: types.VISIBILITY_CHECKBOX_CHANGE,
        visibility
    };
}

/**
 * @param{bool} checkboxState
 * @returns {{type, checkboxState: *}}
 */
export function tagsVisibilityCheckboxChange(isVisible) {
    return {
        type: types.TAGS_VISIBILITY_CHECKBOX_CHANGE,
        isVisible
    };
}

/**
 * @param{bool} checkboxState
 * @returns {{type, checkboxState: *}}
 */
export function depthCheckboxChange(checkboxState) {
    const depth = checkboxState ? 2 : 1;
    return {
        type: types.DEPTH_CHECKBOX_CHANGE,
        depth
    };
}

export function tagsSelectChange(selectState) {
    const tags = {};
    tags[selectState.name] = selectState.value;
    return {
        type: types.TAGS_SELECT_CHANGE,
        tags
    };
}

export function openDetailsPanel(nodeId) {
    return {
        type: types.OPEN_DETAILS_PANEL,
        nodeId
    };
}

export function closeDetailsPanel() {
    return {
        type: types.CLOSE_DETAILS_PANEL
    };
}
