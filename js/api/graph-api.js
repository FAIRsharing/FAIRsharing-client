import store from '../store';
import { getGraphSuccess } from '../actions/graph-actions';
import { API_URL_ROOT, GRAPH_ENDPOINT } from '../utils/api-constants';

const MAX_PATH_LENGTH = 2;

/**
 * @method
 * @name getGraph
 * @description Get the given graph
 */
export function getGraph(graphId) {
    const queryParamsObj = {
        maxPathLength: MAX_PATH_LENGTH
    };
    const queryParams = Object.keys(queryParamsObj)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParamsObj[key])}`)
        .join('&').replace(/%20/g, '+');
    const graphUrl = `/${API_URL_ROOT}/${GRAPH_ENDPOINT}/${graphId}/?${queryParams}`;
    return fetch(graphUrl)
        .then(response => response.json())
        .then(json => {
            // console.log(json);
            store.dispatch(getGraphSuccess(json));
            return json;
        });
}

export function getRelationalGraph(graphId) {
    const graphUrl = `/${API_URL_ROOT}`;
    return fetch(graphUrl)
        .then(response => response.json())
        .then(json => {
            // TODO return json as a graph
            // fire store.dispatch
            return null;
        });

}