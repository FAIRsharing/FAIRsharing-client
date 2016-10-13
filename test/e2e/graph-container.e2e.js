'use strict';

function getDataURLsfromCanvases() {
    var canvases = document.getElementsByTagName('canvas');
    //
    var canvasDataURLs = [], i;
    for (i =0; i<canvases.length; i++) {
        canvasDataURLs.push(canvases[i].toDataURL('image/png'));
    }
    // console.log(canvasDataURLs);
    return canvasDataURLs;

}

module.exports = {

    'Graph page': function(client) {

        const depthCheckboxSelector = 'input[type=checkbox][value=depth]';
        const innerStandardsCheckbox = 'input[type=checkbox][value=Standard-1]';
        const outerDatabasesCheckbox = 'input[type=checkbox][value=BioDBCore-2]';
        let initialCanvasDataURLs = [], depthCanvasDataURLs = [], noInnerStandardsCanvasDataURLs = [], noOuterDatabasesCanvasDataURLs = [];

        client.url('http://localhost:8000/react-home/#/graph/bsg-c000001')
            .waitForElementNotPresent('#isFetchingModal', 10000)
            .waitForElementVisible(depthCheckboxSelector, 2000);

        client.expect.element('#graph').to.be.a('div');

        client.expect.element('#doughnutsCnt').to.be.a('div');

        client.expect.element('#tagsForn').to.not.be.present;

        // const previousCanvasDataURL =
        client.pause(5000);

        client.execute(getDataURLsfromCanvases, [], result => {
            initialCanvasDataURLs = result.value;
            client.assert.equal(initialCanvasDataURLs.length, 4, 'There are now one chart.js canvas and three cytoscape.js canvas');
        });

        client.click(depthCheckboxSelector)
            .pause(5000)
            .expect.element(depthCheckboxSelector).to.be.selected;

        client.execute(getDataURLsfromCanvases, [], result => {
            depthCanvasDataURLs = result.value;
            client.assert.notEqual(initialCanvasDataURLs[0], depthCanvasDataURLs[0], 'The inner chart.js image has changed');
            client.assert.equal(initialCanvasDataURLs[1], depthCanvasDataURLs[3], 'The cytoscape.js first canvas has not changed');
            client.assert.equal(initialCanvasDataURLs[2], depthCanvasDataURLs[4], 'The cytoscape.js second canvas has not changed');
            client.assert.notEqual(initialCanvasDataURLs[3], depthCanvasDataURLs[5], 'The cytoscape.js third canvas has changed');
        });

        client.pause(2000);

        client.click(innerStandardsCheckbox)
            .pause(5000)
            .expect.element(innerStandardsCheckbox).to.not.be.selected;

        client.execute(getDataURLsfromCanvases, [], result => {
            noInnerStandardsCanvasDataURLs = result.value;
            client.assert.notEqual(depthCanvasDataURLs[0], noInnerStandardsCanvasDataURLs[0], 'The inner chart.js image has changed');
            client.assert.equal(depthCanvasDataURLs[1], noInnerStandardsCanvasDataURLs[1], 'The outer chart.js image has not changed');
            client.assert.notEqual(depthCanvasDataURLs[2], noInnerStandardsCanvasDataURLs[2], 'The total chart.js image has changed');
            client.assert.equal(depthCanvasDataURLs[3], noInnerStandardsCanvasDataURLs[3], 'The cytoscape.js first canvas has not changed');
            client.assert.equal(depthCanvasDataURLs[4], noInnerStandardsCanvasDataURLs[4], 'The cytoscape.js second canvas has not changed');
            client.assert.notEqual(depthCanvasDataURLs[5], noInnerStandardsCanvasDataURLs[5], 'The cytoscape.js third canvas has changed');
        });

        client.pause(2000);

        client.click(outerDatabasesCheckbox)
            .pause(5000)
            .expect.element(outerDatabasesCheckbox).to.not.be.selected;

        client.pause(2000);

        client.execute(getDataURLsfromCanvases, [], result => {
            noOuterDatabasesCanvasDataURLs = result.value;
            client.assert.equal(noInnerStandardsCanvasDataURLs[0], noOuterDatabasesCanvasDataURLs[0], 'The inner chart.js image has not changed');
            client.assert.notEqual(noInnerStandardsCanvasDataURLs[1], noOuterDatabasesCanvasDataURLs[1], 'The outer chart.js image has changed');
            client.assert.notEqual(noInnerStandardsCanvasDataURLs[2], noOuterDatabasesCanvasDataURLs[2], 'The total chart.js image has changed');
            client.assert.equal(noInnerStandardsCanvasDataURLs[3], noOuterDatabasesCanvasDataURLs[3], 'The cytoscape.js first canvas has not changed');
            client.assert.equal(noInnerStandardsCanvasDataURLs[4], noOuterDatabasesCanvasDataURLs[4], 'The cytoscape.js second canvas has not changed');
            client.assert.notEqual(noInnerStandardsCanvasDataURLs[5], noOuterDatabasesCanvasDataURLs[5], 'The cytoscape.js third canvas has changed');
        });

        client.end();

    }

};
