/**
 * @method
 * @name relational2graph
 * @param{Object} relationalEntity
 * @return{Object} graph
 *                  - nodes
 *                  - edges
 */
export function relational2graph(relationalEntity) {
    const nodes = [], edges = [];

    // missing label
    for (const standard of relationalEntity.standards) {
        nodes.push({properties: standard, path_length: 1 });
    }
    for (const policy of relationalEntity.policies) {
        nodes.push({properties: policy, path_length: 1});
    }
    for (const database of relationalEntity.databases) {
        nodes.push({properties: database, path_length: 1});
    }
    return {
        nodes: nodes,
        edges: edges
    };
}
