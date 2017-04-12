import store from '../store';
import { handleHTTPErrors } from '../utils/helper-funcs';
import { sendRemoteRequest, getRemoteError } from '../actions/main-actions';
import { getGraphSuccess } from '../actions/graph-actions';
import { API_URL_ROOT, GRAPH_ENDPOINT, META_TAG_API_KEY } from '../utils/api-constants';

const MAX_PATH_LENGTH = 2;

/**
 * @method
 * @name getGraph
 * @description Get the given graph
 */
export function getGraph(graphId) {
    const queryParamsObj = {
            maxPathLength: MAX_PATH_LENGTH
        }, apiKey = document.querySelector(`meta[name=${META_TAG_API_KEY}]`).getAttribute('content');
    console.log(apiKey);
    const headers = new Headers();
    headers.append('Api-Key', apiKey);
    const queryParams = Object.keys(queryParamsObj)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParamsObj[key])}`)
        .join('&').replace(/%20/g, '+');
    const graphUrl = `/${API_URL_ROOT}/${GRAPH_ENDPOINT}/${graphId}/?${queryParams}`;
    store.dispatch(sendRemoteRequest());
    return fetch(graphUrl, {
        headers
    })
        .then(handleHTTPErrors)
        .then(response => response.json())
        .then(json => {
            // console.log(json);
            store.dispatch(getGraphSuccess(json));
            return json;
        })
        .catch(err => {
            store.dispatch(getRemoteError(err));
        });
}

/*
export function getRelationalGraph(graphId) {
    const graphUrl = `/${API_URL_ROOT}`;
    return fetch(graphUrl)
        .then(response => response.json())
        .then(json => {
            // TODO return json as a graph
            // fire store.dispatch
            return null;
        });

} */
