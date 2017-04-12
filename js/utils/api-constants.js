/**
 * Created by massi on 25/04/2016.
 */

// API urls
export const API_URL_ROOT = 'api';
export const GRAPH_ENDPOINT = 'graph';
export const DATABASE_ENDPOINT = 'database';
export const STANDARD_ENDPOINT = 'standard';
export const TAGS_ENDPOINT = 'tags';

// Layouts
export const COLA_LAYOUT = 'cola';
export const COSE_LAYOUT = 'cose';
export const CONCENTRIC_LAYOUT = 'concentric';
export const GRAPH_LAYOUTS = {
    COLA: 'cola',
    COSE: 'cose',
    CONCENTRIC: 'concentric'
};

// Biosharing entities
export const BIOSHARING_COLLECTION = 'BiosharingCollection';
export const BIOSHARING_ENTITIES = {
    DATABASE: {
        value: 'BioDBCore',
        label: 'Database',
        rank: 1
    },
    STANDARD: {
        value: 'Standard',
        label: 'Standard',
        rank: 2
    },
    POLICY: {
        value: 'Policy',
        label: 'Policy',
        rank: 3
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
    ['Domain', '#ff8c00'],   // DarkOrange
    // the following are just sub-types of Standard so they share the same color of it
    ['terminology artifact', '#d4d413'],
    ['model/format', '#d4d413'],
    ['reporting guideline', '#d4d413']
]);

export const RELATIONS_COLOR_MAP = new Map([
    [undefined, '#d9d9d9'],
    ['CONTAINS', '#00cc66'],
    ['RECOMMENDS', '#0000ff'], // teal
    ['COLLECTS', '#00ffff'], //blue
    ['IMPLEMENTS', '#ff00ff'],
    ['RELATED TO', '#ff0000']
]);

export const ENTITY_SHAPE_MAP = new Map([
    [undefined, 'ellipse'],
    ['BioDBCore', 'ellipse'],
    ['Policy', 'ellipse'],
    ['BiosharingCollection', 'ellipse'],
    ['terminology artifact', 'triangle'],
    ['model/format', 'diamond'],
    ['reporting guideline', 'hexagon']
]);

export const ENTITY_LABELS_SINGULAR = {
    'BioDBCore': 'Database',
    'Policy': 'Policy',
    'Standard': 'Standard',
    'BiosharingCollection': 'Collection',
    'Domain': 'Domain',
    'Taxonomy': 'Taxonomy'
};

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

// Resource/Entity Statuses
export const RESOURCE_STATUSES = [
    {
        value: 'UNC',
        label: 'Uncertain',
        rank: 1
    },
    {
        value: 'DEP',
        label: 'Deprecated',
        rank: 2
    },
    {
        value: 'DEV',
        label: 'In development',
        rank: 3
    },
    {
        value: 'RDY',
        label: 'Ready',
        rank: 4
    }
];

// meta tag for api key
export const META_TAG_API_KEY = 'api-key';
