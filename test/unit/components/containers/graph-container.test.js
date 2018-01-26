import { expect } from 'chai';
import sinon from 'sinon';
import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureStore from 'redux-mock-store';

import ConnectedGraphContainer, { GraphContainer } from '../../../../js/components/containers/graph-container';
import GraphHandler from '../../../../js/models/graph';
import { initialState as initialGraphState } from '../../../../js/reducers/graph-reducer';
import { BIOSHARING_COLLECTION, BIOSHARING_ENTITIES, GRAPH_LAYOUTS } from '../../../../js/utils/api-constants';
import * as graphApi from '../../../../js/api/graph-api';

import synthGraph from '../../../fixtures/graph.json';
import testGraph from '../../../fixtures/graph-bsg-c000001.json';

const middlewares = [];
const mockStore = configureStore(middlewares);

/**
 *
 */
describe('<GraphContainer />', () => {

    describe('mount()', function() {

        let apiStub, graphRenderStub, spy, store;

        beforeEach(function() {
            const initialState = {
                graphState: initialGraphState
            };
            store = mockStore(initialState);
            apiStub = sinon.stub(graphApi, 'getGraph');
            graphRenderStub = sinon.stub(GraphHandler.prototype, 'render');
            spy = sinon.spy(ConnectedGraphContainer.prototype, 'componentDidMount');
            mount(<Provider store={store}><ConnectedGraphContainer match={
                { params: { graphId: 'bsg-000001' } }
            }/></Provider>);
        });

        afterEach(function() {
            graphApi.getGraph.restore();
            GraphHandler.prototype.render.restore();
            ConnectedGraphContainer.prototype.componentDidMount.restore();
        });


        it('calls successfully componentDidMount()', function() {
            expect(spy.calledOnce).to.be.true;
        });

        it('calls successfully graphApi.getGraph()', function() {
            expect(apiStub.calledOnce).to.be.true;
        });

    });

});
