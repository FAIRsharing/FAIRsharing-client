import { combineReducers } from 'redux';

//reducers
import graphReducer from './graph-reducer';

const reducers = combineReducers({
    graph: graphReducer
});

export default reducers;