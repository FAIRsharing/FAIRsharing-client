import store from '../store';
import { handleHTTPErrors, serialize } from '../utils/helper-funcs';
import { sendRemoteRequest } from '../actions/main-actions';
// import { getDatabaseSuccess, getTagsSuccess } from '../actions/database-actions';
import { API_URL_ROOT, DATABASE_ENDPOINT, STANDARD_ENDPOINT, TAGS_ENDPOINT } from '../utils/api-constants';

export function getDatabase(biodbcoreId) {
    const databaseUrl = `/${API_URL_ROOT}/${DATABASE_ENDPOINT}/${biodbcoreId}`;
    store.dispatch(sendRemoteRequest());
    return fetch(databaseUrl)
        .then(handleHTTPErrors)
        .then(response => response.json());
        /*
        .then(json => {
            store.dispatch(getDatabaseSuccess(json));
            return json;
        })
        .catch(err => {
            store.dispatch(getRemoteError(err));
        }); */
}

export function getTags() {
    const tagsUrl = `/${API_URL_ROOT}/${TAGS_ENDPOINT}/`;
    store.dispatch(sendRemoteRequest());
    return fetch(tagsUrl)
        .then(handleHTTPErrors)
        .then(response => response.json());
        /*
        .then(json => {
            store.dispatch(getTagsSuccess(json));
        })
        .catch(err => {
            store.dispatch(getRemoteError(err));
        }); */
}

/**
 * @method
 * @name getStandardList
 * @param{Object} - queryParams
 * @return Promise - returning an array of Standards
 */
export function getStandardList(queryParams) {
    // TODO check for allowed parameters?
    const queryStr = `${serialize(queryParams)}`;
    const standardUrl = `/${API_URL_ROOT}/${STANDARD_ENDPOINT}/?${queryStr}`;
    return fetch(standardUrl)
        .then(handleHTTPErrors)
        .then(response => response.json());

}

/**
 * @method
 * @name getStandardList
 * @param{Object} - queryParams
 * @return Promise - returning an array of Databases
 */
export function getDatabaseList(queryParams) {
    const queryStr = `${serialize(queryParams)}`;
    const standardUrl = `/${API_URL_ROOT}/${DATABASE_ENDPOINT}/?${queryStr}`;
    return fetch(standardUrl)
        .then(handleHTTPErrors)
        .then(response => response.json());
}
