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