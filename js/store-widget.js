import { createStore } from 'redux';
import graphReducer from './reducers/graph-reducer';

const store = createStore(graphReducer);
export default store;
