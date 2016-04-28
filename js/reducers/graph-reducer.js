import * as types from '../actions/action-types';

const initialState = {
    graph: {
        nodes: [],
        edges: []
    }
};

const graphReducer = function (state = initialState, action) {

    switch (action.type) {

        case types.GET_GRAPH_SUCCESS:
            return { ...state, graph: action.graph };

    }

    return state;

};

export default graphReducer;