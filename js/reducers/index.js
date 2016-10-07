import { combineReducers } from 'redux';

import { reducer as formReducer } from 'redux-form';

// custom-made reducers
import graphReducer from './graph-reducer';
import databaseReducer from './database-reducer';

const reducers = combineReducers({
    databaseState: databaseReducer,
    graphState: graphReducer,
    form: formReducer
});

export default reducers;
