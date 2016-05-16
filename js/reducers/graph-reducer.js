import * as types from '../actions/action-types';
import { GRAPH_LAYOUTS } from '../utils/api-constants';


const initialState = {
    graph: {
        nodes: [],
        edges: []
    },
    layout: {
        name: GRAPH_LAYOUTS.COLA,
        visibility: {
            databases: true,
            standards: true,
            policies: true
        }
    }
    
};

const graphReducer = function (state = initialState, action) {

    switch (action.type) {

        case types.GET_GRAPH_SUCCESS:
            return { ...state, graph: action.graph };
        
        case types.LAYOUT_SELECT_CHANGE:
            return { ...state, layout: { ...state.layout, ...action.layout } };

    }

    return state;

};

export default graphReducer;