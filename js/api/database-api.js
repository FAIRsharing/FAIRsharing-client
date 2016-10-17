import store from '../store';
import { handleHTTPErrors } from '../utils/helper-funcs';
import { sendRemoteRequest, getRemoteError } from '../actions/main-actions';
import { getDatabaseSuccess, getTagsSuccess } from '../actions/database-actions';
import { API_URL_ROOT, DATABASE_ENDPOINT, TAGS_ENDPOINT } from '../utils/api-constants';

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