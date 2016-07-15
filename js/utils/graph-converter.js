import _ from 'lodash';
import { GRAPH_RELATIONS } from './api-constants';

/*
function pushItem(item, itemType, depth, nodes, edges) {
    nodes.push({
        labels: [itemType],
        properties: item,
        path_length: depth
    });

} */


/**
 * @method
 * @name relational2graph
 * @description convert a relational entity (i.e.. a Biosharing Collection) into a graph, i.e. a list of nodes, and a list of edges
 * @param{Object} collection
 * @return{Object} graph
 *                  - nodes
 *                  - edges
 */
export function relational2graph(collection) {
    const nodes = [], edges = [];
    nodes.push({properties: _.omit(collection,
        ['standards', 'policies', 'databases', 'created_by', 'lastEditor'])});

    // missing label
    for (const standard of collection.standards) {
        nodes.push({labels:[], properties: standard, path_length: 1 });
        edges.push({
            source: collection.bsg_id,
            target: standard.bsg_id,
            relationship: GRAPH_RELATIONS.COLLECTS
        });
        for (const relatedStandard of standard.related_standard) {

        }
     }
    for (const policy of collection.policies) {
        nodes.push({labels:[], properties: policy, path_length: 1});
        edges.push({
            source: collection.bsg_id,
            target: policy.bsg_id,
            relationship: GRAPH_RELATIONS.COLLECTS
        });
        for (const standardImplementation of policy.std_implementation) {

        }
        for (const databaseImplementation of policy.db_implementation) {

        }
        for (const relatedPolicy of policy.related_policies) {

        }
    }
    for (const database of collection.databases) {
        nodes.push({labels:[], properties: database, path_length: 1});
        edges.push({
            source: collection.bsg_id,
            target: database.bsg_id,
            relationship: GRAPH_RELATIONS.COLLECTS
        });
        for (const standardImplemented of database.standardsImplemented) {

        }
        for (const relatedDatabases of database.related_databases) {
            
        }

    }
    return {
        nodes: nodes,
        edges: edges
    };
}
