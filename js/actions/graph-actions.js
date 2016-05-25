import * as types from './action-types';

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

export function visibilityCheckboxChange(checkboxState) {
    const visibility = {};
    visibility[checkboxState.value] = checkboxState.checked;
    return {
        type: types.VISIBILITY_CHECKBOX_CHANGE,
        visibility
    };
}

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
