import { expect } from 'chai';
import GraphContainer, { GraphHandler, nodeFilters } from '../../../../js/components/containers/graph-container';
import { BIOSHARING_COLLECTION } from '../../../../js/utils/api-constants';

describe('nodeFilters', () => {

    const thisArg = {
        blacklistedLabels: { 1: ['BLACKLISTED_1A', 'BLACKLISTED_1B'], 2:['BLACKLISTED_2A'] },
        tags: {
            'domains': {
                selected: ['Genome', 'Proteome', 'Transcriptome'],
                unselected: []
            },
            'taxonomies': {
                selected: ['Homo sapiens', 'Mus musculus'],
                unselected: []
            }
        },
        depth: 1
    };

    describe('filterByLabel', () => {

        it('should return false for a node that contains blacklisted labels', () => {
            const node = {
                labels: ['BLACKLISTED_1A'],
                properties: {
                    'application_id': 'bsg-000001'
                },
                'path_length': 1
            };
            expect(nodeFilters.filterByLabel.call(thisArg, node)).to.equal(false);
        });

        it('should return false for a node that contains blacklisted labels', () => {
            const node = {
                labels: ['BLACKLISTED_2A', 'ANOTHER_LABEL'],
                properties: {
                    'application_id': 'bsg-000001'
                },
                'path_length': 2
            };
            expect(nodeFilters.filterByLabel.call(thisArg, node)).to.equal(false);
        });

        it('should return true for a node that does not contain blacklisted labels', () => {
            const node = {
                labels: ['LABEL', 'ANOTHER_LABEL'],
                properties: {
                    'application_id': 'bsg-000001'
                },
                'path_length': 1
            };
            expect(nodeFilters.filterByLabel.call(thisArg, node)).to.equal(true);
        });

        it('should return true for a node that does not contain blacklisted labels for that depth level', () => {
            const node = {
                labels: ['LABEL', 'ANOTHER_LABEL', 'BLACKLISTED_2A'],
                properties: {
                    'application_id': 'bsg-000001'
                },
                'path_length': 1
            };
            expect(nodeFilters.filterByLabel.call(thisArg, node)).to.equal(true);
        });

    });


    describe('filterByTags', () => {

        it('should return false for a node that does not contain at lest a tag per tag type', () => {
            const node = {
                labels: ['LABEL', 'ANOTHER_LABEL'],
                properties: {
                    'application_id': 'bsg-000001',
                    'domains': ['Genome', 'Gene Annotation', 'Bao'],
                    'taxonomies': ['Rattus norvegicus', 'Gorilla gorilla gorilla']
                },
                'path_length': 1
            };
            expect(nodeFilters.filterByTags.call(thisArg, node)).to.equal(false);
        });

        it('should return true for a node that contains at lest a tag per tag type', () => {
            const node = {
                labels: ['LABEL', 'ANOTHER_LABEL'],
                properties: {
                    'application_id': 'bsg-000001',
                    'domains': ['Genome', 'Gene Annotation', 'Bao'],
                    'taxonomies': ['Rattus norvegicus', 'Mus musculus']
                },
                'path_length': 1
            };
            expect(nodeFilters.filterByTags.call(thisArg, node)).to.equal(true);
        });

    });


    describe('filterByDepth', () => {

        it('should return false for a node that has path_length length longer than the authorised depth', () => {
            const node = {
                labels: ['LABEL', 'ANOTHER_LABEL'],
                properties: {
                    'application_id': 'bsg-000001',
                    'domains': ['Genome', 'Gene Annotation', 'Bao'],
                    'taxonomies': ['Rattus norvegicus', 'Gorilla gorilla gorilla']
                },
                'path_length': 2
            };
            expect(nodeFilters.filterByDepth.call(thisArg, node)).to.equal(false);
        });

        it('should return true for a node that has path_length length shorter than the authorised depth', () => {
            const node = {
                labels: ['LABEL', 'ANOTHER_LABEL'],
                properties: {
                    'application_id': 'bsg-000001',
                    'domains': ['Genome', 'Gene Annotation', 'Bao'],
                    'taxonomies': ['Rattus norvegicus', 'Mus musculus']
                },
                'path_length': 1
            };
            expect(nodeFilters.filterByDepth.call(thisArg, node)).to.equal(true);
        });

    });

    describe('filterOutRecommendations', () => {

        it('should return false if the node has a "recommendation" boolean field set to true', () => {
            const node = {
                labels: ['LABEL', 'ANOTHER_LABEL'],
                properties: {
                    'application_id': 'biosharingcollection-000001',
                    'domains': ['Genome', 'Gene Annotation', 'Bao'],
                    'taxonomies': ['Rattus norvegicus', 'Mus musculus'],
                    'recommendation': true
                },
                'path_length': 0
            };
            expect(nodeFilters.filterOutRecommendations.call(thisArg, node)).to.equal(false);
        });

        it('should return truee if the node has a "recommendation" boolean field set to false', () => {
            const node = {
                labels: ['LABEL', 'ANOTHER_LABEL'],
                properties: {
                    'application_id': 'biosharingcollection-000001',
                    'domains': ['Genome', 'Gene Annotation', 'Bao'],
                    'taxonomies': ['Rattus norvegicus', 'Mus musculus'],
                    'recommendation': false
                },
                'path_length': 0
            };
            expect(nodeFilters.filterOutRecommendations.call(thisArg, node)).to.equal(true);
        });

        it('should return truee if the node has no "recommendation" field', () => {
            const node = {
                labels: ['LABEL', 'ANOTHER_LABEL'],
                properties: {
                    'application_id': 'biosharingcollection-000001',
                    'domains': ['Genome', 'Gene Annotation', 'Bao'],
                    'taxonomies': ['Rattus norvegicus', 'Mus musculus']
                },
                'path_length': 0
            };
            expect(nodeFilters.filterOutRecommendations.call(thisArg, node)).to.equal(true);
        });

    });

    describe('filterOutCollections', () => {

        it('should return true if the node is labeled as a collection and is the central node', () => {
            const node = {
                labels: [BIOSHARING_COLLECTION],
                properties: {
                    'application_id': 'biosharingcollection-000001',
                    'domains': ['Genome', 'Gene Annotation', 'Bao'],
                    'taxonomies': ['Rattus norvegicus', 'Mus musculus']
                },
                'path_length': 0
            };
            expect(nodeFilters.filterOutCollections.call(thisArg, node)).to.equal(true);
        });

        it('should return false if the node is labeled as a collection and is not central node', () => {
            const node = {
                labels: [BIOSHARING_COLLECTION],
                properties: {
                    'application_id': 'biosharingcollection-000001',
                    'domains': ['Genome', 'Gene Annotation', 'Bao'],
                    'taxonomies': ['Rattus norvegicus', 'Mus musculus']
                },
                'path_length': 1
            };
            expect(nodeFilters.filterOutCollections.call(thisArg, node)).to.equal(false);
        });

        it('should return true if the node is not labeled as a collection', () => {
            const node = {
                labels: ['NOT_A_COLLECTION'],
                properties: {
                    'application_id': 'biosharingcollection-000001',
                    'domains': ['Genome', 'Gene Annotation', 'Bao'],
                    'taxonomies': ['Rattus norvegicus', 'Mus musculus']
                },
                'path_length': 1
            };
            expect(nodeFilters.filterOutCollections.call(thisArg, node)).to.equal(true);
        });

    });

});

describe('GraphHandler', () => {});

describe('GraphContainer', () => {});