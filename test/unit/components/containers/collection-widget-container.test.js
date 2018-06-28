import { expect } from 'chai';
import sinon from 'sinon';

import React from 'react';
// import ReactDOM from 'react-dom';

import { shallow } from 'enzyme';

import { CollectionWidgetContainer, GraphMainBox, TableBox } from '../../../../js/components/containers/collection-widget-container';
import * as api from '../../../../js/api/graph-api';

describe('<CollectionWidgetContainer />', function() {

    let spyCDP, spyHLC, spyVCC, spyDCC, spyTVCC, spyTSC, spyTC, spyRG, stub,
        container, wrapper;

    beforeEach(function() {
        spyCDP = sinon.spy(), spyHLC = sinon.spy(), spyVCC = sinon.spy(),
            spyDCC = sinon.spy(), spyTVCC = sinon.spy(), spyTSC = sinon.spy(),
            spyTC = sinon.spy(), spyRG = sinon.spy(), stub = sinon.stub(api, 'getGraphWidget'),
            container = <CollectionWidgetContainer
                collectionId='bsg-c000001'  apiKey='fakeKey' host='https://fakekost.fake'
                closeDetailsPanel={spyCDP}
                handleLayoutChange={spyHLC} visibilityCheckboxChange={spyVCC}
                depthCheckboxChange={spyDCC} tagsVisibilityCheckboxChange={spyTVCC}
                tagsSelectChange={spyTSC} tagsChange={spyTC} resetGraph={spyRG}
            />,
            wrapper = shallow(container);

    });

    it('should correctly instantiate the widget container', function() {
        expect(wrapper.find(GraphMainBox)).to.have.lengthOf(1);
        expect(wrapper.find(TableBox)).to.have.lengthOf(1);
    });

});
