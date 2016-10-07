import * as types from '../actions/action-types';

export const initialState = {
    database: null,
    isFetching: false
};

/**
 * @method
 * @name databaseReducer
 * @param{Object} state
 * @param{Object} action
 * @return Object - next state
 */
const databaseReducer = function (state = initialState, action) {

    switch (action.type) {

        case types.SEND_REMOTE_REQUEST: {
            return {
                ...state,
                isFetching: true
            };
        }

        case types.GET_DATABASE_SUCCESS: {
            return {
                ...state,
                database: action.database,
                isFetching: false
            };
        }

        case types.GET_REMOTE_ERROR: {
            return {
                ...state,
                error: action.error,
                isFetching: false
            };
        }
    }

    return state;
};

export default databaseReducer;
