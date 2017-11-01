import { expect } from 'chai';
import React from 'react';
// import ReactDOM from 'react-dom';
// import ReactTestUtils from 'react-addons-test-utils';
import { shallow } from 'enzyme';
import Slider from 'rc-slider';
import Graph, { ZoomSlider } from '../../../../js/components/views/graph';
import { GRAPH_LAYOUTS } from '../../../../js/utils/api-constants';
import { visibilityObj, tagSelectorObj } from '../../../test-constants';
import GraphHandler from '../../../../js/models/graph';
import testGraph from '../../../fixtures/graph-bsg-c000001.json';

describe('graph', () => {

    let testHandler, testLayout, component, wrapper;

    beforeEach(() => {
        testLayout = {
            name: GRAPH_LAYOUTS.COLA,
            visibility: visibilityObj,
            isTagsPanelVisible: false,
            tags: tagSelectorObj,
            depth: 1
        };
        testHandler = new GraphHandler(testGraph, testLayout);
        component = <Graph handler={testHandler} layout={testLayout} />;
        wrapper = shallow(component);
    });

    it('should instantiate the graph visualiser element', () => {
        expect(wrapper.find('#graphCnt')).to.have.length(1);
    });

    it('should render the form for the sliders controls', () => {
        expect(wrapper.find('form.form')).to.have.length(1);
    });

    it('should contain as many slider as are the tunable params in the selected layout (COLA) plus the ZOOM slider', () => {
        expect(wrapper.find(ZoomSlider)).to.have.length(1);
        const tunableParamsCount = testHandler.getTunableParams().length;
        expect(wrapper.find(Slider)).to.have.length(tunableParamsCount);
    });

});
