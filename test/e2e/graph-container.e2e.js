module.exports = {

    'Test page': function(client) {
        client.url('http://localhost:8000/react-home/#/graph/bsg-c000001')
            .waitForElementNotPresent('#isFetchingModal', 10000);

        client.expect.element('#graph').to.be.a('div');

        client.expect.element('#doughnutsCnt').to.be.a('div');

        client.expect.element('#tagsForn').to.not.be.present;

        client.end();

    }

};
