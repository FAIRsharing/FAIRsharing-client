import * as types from './action-types';

export function getDatabaseRequest() {
    return {
        type: types.GET_DATABASE_REQUEST
    };
}

export function getDatabaseSuccess(database) {
    return {
        type: types.GET_DATABASE_SUCCESS,
        database
    };
}

export function getDatabaseError(error) {
    return {
        type: types.GET_DATABASE_ERROR,
        error
    };
}
