import store from '../store';
import { handleHTTPErrors } from '../utils/helper-funcs';
import { getDatabaseRequest, getDatabaseSuccess, getDatabaseError} from '../actions/database-actions';
import { API_URL_ROOT, DATABASE_ENDPOINT } from '../utils/api-constants';

export function getDatabase(biodbcoreId) {
    const databaseUrl = `/${API_URL_ROOT}/${DATABASE_ENDPOINT}/${biodbcoreId}`;
    store.dispatch(getDatabaseRequest());
    return fetch(databaseUrl)
        .then(handleHTTPErrors)
        .then(response => response.json())
        .then(json => {
            store.dispatch(getDatabaseSuccess(json));
            return json;
        })
        .catch(err => {
            store.dispatch(getDatabaseError(err));
        });
}
