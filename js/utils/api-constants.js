/**
 * Created by massi on 25/04/2016.
 */
export const API_URL_ROOT = 'api';
export const GRAPH_ENDPOINT = 'graph';
export const COLA_LAYOUT = 'cola';
export const COSE_LAYOUT = 'cose';
export const CONCENTRIC_LAYOUT = 'concentric';
export const GRAPH_LAYOUTS = {
    COLA: 'cola',
    COSE: 'cose',
    CONCENTRIC: 'concentric'
};
export const BIOSHARING_COLLECTION = 'BiosharingCollection';
export const BIOSHARING_ENTITIES = {
    DATABASE: {
        value: 'BioDBCore',
        label: 'Database'
    },
    POLICY: {
        value: 'Policy',
        label: 'Policy'
    },
    STANDARD: {
        value: 'Standard',
        label: 'Standard'
    }
};
export const TAG_TYPES = {
    DOMAINS: {
        value: 'domains',
        label: 'Domains',
        initialState: {
            selected: [],
            unselected: []
        }
    },
    TAXONOMIES: {
        value: 'taxonomies',
        label: 'Species',
        initialState: {
            selected: [],
            unselected: []
        }
    }
};
export const ALLOWED_FIELDS = ['application_id', 'name', 'shortName', 'domains', 'taxonomies', 'status', 'yearOfCreation'];
