import { combineReducers } from 'redux';

//reducers
import graphReducer from './graph-reducer';

const reducers = combineReducers({
    graphState: graphReducer
});

export default reducers;