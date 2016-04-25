import * as types from './action-types';

export function  getGraphSuccess(graph) {
    return {
        type: types.GET_GRAPH_SUCCESS,
        graph
    };
}