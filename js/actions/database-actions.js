import * as types from './action-types';

export function getDatabaseSuccess(database) {
    return {
        type: types.GET_DATABASE_SUCCESS,
        database
    };
}

export function getTagsSuccess(tags) {
    return {
        type: types.GET_TAGS_SUCCESS,
        tags
    };
}
