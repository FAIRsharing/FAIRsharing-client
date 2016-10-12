const CANVAS_EXPORT_FORMAT = 'image/png';

module.exports = {

    'Graph page': function(client) {

        const depthCheckboxSelector = 'input[type=checkbox][value=depth]';

        client.url('http://localhost:8000/react-home/#/graph/bsg-c000001')
            .waitForElementNotPresent('#isFetchingModal', 10000)
            .waitForElementVisible(depthCheckboxSelector, 2000);

        client.expect.element('#graph').to.be.a('div');

        client.expect.element('#doughnutsCnt').to.be.a('div');

        client.expect.element('#tagsForn').to.not.be.present;

        // const previousCanvasDataURL =
        client.pause(5000);

        const previousCanvasDataURLs = [], nextCanvasDataURLs = [];

        client.execute(() => {
            console.log('Executing embedded JS method');
            const canvases = document.getElementsByTagName('canvas');
            this.assert.equal(canvases.length, 4, 'There are now one chart.js canvas and three cytoscape.js canvas');
            for (const canvas in canvases) {
                previousCanvasDataURLs.push(canvas.toDataURL(CANVAS_EXPORT_FORMAT));
            }
        }, []);

        client.click(depthCheckboxSelector)
            .pause(5000)
            .expect.element(depthCheckboxSelector).to.be.selected;

        client.execute(() => {
            const canvases = document.getElementsByTagName('canvas');
            this.assert.equal(canvases.length, 6, 'There are now three chart.js canvas and three cytoscape.js canvas');
            for (const canvas in canvases) {
                nextCanvasDataURLs.push(canvas.toDataURL(CANVAS_EXPORT_FORMAT));
            }
            this.assert.notEqual(previousCanvasDataURLs[0], nextCanvasDataURLs[0], 'The inner chart.js image has changed');
            this.assert.notEqual(previousCanvasDataURLs[1], nextCanvasDataURLs[3], 'The cytoscape.js canvases have changes - 1');
            this.assert.notEqual(previousCanvasDataURLs[2], nextCanvasDataURLs[4], 'The cytoscape.js canvases have changes - 2');
            this.assert.notEqual(previousCanvasDataURLs[3], nextCanvasDataURLs[5], 'The cytoscape.js canvases have changes - 3');
        }, []);

        client.pause(5000);
        client.end();

    }

};
