/**
 * Created by massi on 25/04/2016.
 */
import _ from 'lodash';

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
export const DEPTH_LEVELS = [1,2];

export const GRAPH_RELATIONS = {
    COLLECTS: 'COLLECTS',
    RECOMMENDS: 'RECOMMENDS',
    IMPLEMENTS: 'IMPLEMENTS'
};

// background colors for Biosharing Entities
export const ENTITIES_COLOR_MAP = new Map([
    [undefined, '#d9d9d9'],
    ['BiosharingCollection', '#ff4000'], //red
    ['Policy', '#9cf76e'],    //green
    ['BioDBCore', '#e67300'], //orange/ocre
    ['Standard', '#d4d413'],  // azure
    ['Taxonomy', '#9acd32'], // YellowGreen
    ['Domain', '#ff8c00']   // DarkOrange
]);

export const RELATIONS_COLOR_MAP = new Map([
    [undefined, '#d9d9d9'],
    ['CONTAINS', '#00cc66'],
    ['RECOMMENDS', 'Teal'],
    ['COLLECTS', '#0099cc'], //blue
    ['IMPLEMENTS', '#99CCFF'],
    ['TAGGED WITH', 'Chartreuse']
]);

export const ENTITY_LABELS_PLURAL = {
    'BioDBCore': 'Databases',
    'Policy': 'Policies',
    'Standard': 'Standards',
    'BiosharingCollection': 'Collections',
    'Domain': 'Domains',
    'Taxonomy': 'Taxonomies'
};

export const TAG_ENTITIES = ['Taxonomy', 'Domain'];

// Count charts titles
export const GRAPH_COUNT = 'Count';
export const GRAPH_COUNT_INNER = 'Count - Inner';
export const GRAPH_COUNT_OUTER = 'Count - Outer';
export const GRAPH_COUNT_TOTAL = 'Count - Total';
