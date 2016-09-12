import { expect } from 'chai';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import Slider from 'rc-slider';
import Graph from '../../../../js/components/views/graph';
import { GRAPH_LAYOUTS } from '../../../../js/utils/api-constants';
import { visibilityObj, tagSelectorObj } from '../../../test-constants';
import GraphHandler from '../../../../js/models/graph';
import testGraph from '../../../fixtures/graph-bsg-c000001.json';

describe('graph', () => {

    let testHandler, testLayout, component;

    beforeEach(() => {
        testLayout = {
            name: GRAPH_LAYOUTS.COLA,
            visibility: visibilityObj,
            isTagsPanelVisible: false,
            tags: tagSelectorObj,
            depth: 1
        };
        testHandler = new GraphHandler(testGraph, testLayout);
        component = ReactTestUtils.renderIntoDocument(
            <Graph handler={testHandler} layout={testLayout} />
        );
    });

    it('should instantiate the graph visualiser element', () => {
        const graph = ReactTestUtils.findRenderedDOMComponentWithClass(component, 'graph');
        expect(graph.id).to.equal('graph');
    });

    it('should render the form for the sliders controls', () => {
        const form = ReactTestUtils.findRenderedDOMComponentWithTag(component, 'form');
        // const divs = ReactTestUtils.scryRenderedDOMComponentsWithTag(component, 'div');
        expect(form.children).to.have.lengthOf(1);
        const formChild = form.children[0];
        expect(formChild.classList).to.have.lengthOf(2);
        expect(formChild.classList[1]).to.equal('graph-sliders-div');
        // console.log(graphCanvases.length);
    });

    it('should contain as many slider as are the tunable params in the selected layout (COLA)', () => {
        const sliders = ReactTestUtils.scryRenderedComponentsWithType(component, Slider);
        const tunableParams = testHandler.getTunableParams();
        expect(sliders).to.have.lengthOf(tunableParams.length);
    });

});
