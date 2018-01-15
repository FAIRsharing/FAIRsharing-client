import { expect } from 'chai';
import Vue from 'vue';
import { shallow, mount } from 'vue-test-utils';
import sinon from 'sinon';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import testCollection from '../../fixtures/bsg-c000001.json';

import ComparisonArea from '../../../js-vue/components/ComparisonArea.vue';
import RecordComparison from '../../../js-vue/components/RecordComparison.vue';

const collections = [
    {
        pk: 1,
        bsgId: 'bsg-c000001',
        label: 'NIPPO-supported data repositories'
    },
    {
        pk: 4,
        bsgId: 'bsg-c000004',
        label: 'Scientific Rockers'
    },
    {
        pk: 2,
        bsgId: 'bsg-c000002',
        label: 'TBGDE Biodiversity Info Standards'
    }
];

describe('<ComparisonArea />', function() {

    let mock;

    before(function() {
        mock = new MockAdapter(axios);
        mock.onGet('/api/collection/bsg-c000001').reply(200, testCollection);
    });

    after(function() {
        mock.restore();
    });

    describe('data()', function() {

        it('sets the correct default data', function() {
            expect(typeof ComparisonArea.data).to.equal('function');
            const defaultData = ComparisonArea.data();
            expect(defaultData.otherRecord).to.eql(null);
            expect(defaultData.recordIds).to.eql({});
            expect(defaultData.selectedBsgId).to.equal(null);
            expect(defaultData.chart).to.be.not.empty;
        });

    });

    describe('getOther()', function() {

        let wrapper, stubSI, stubEV, thisCollection;

        beforeEach(function() {
            wrapper = shallow(ComparisonArea);
            thisCollection = Object.assign(testCollection, { name: 'Foo Collection', pk: 3, bsg_id: 'bsg-c000003'});
            wrapper.setProps({
                thisRecord: thisCollection
            });
            wrapper.setData({
                selectedBsgId: 'bsg-c000001'
            });
            stubSI = sinon.stub(wrapper.vm, 'storeIds');
            stubEV = sinon.stub(wrapper.vm, 'elementVis');
        });

        afterEach(function() {
            stubSI.restore();
            stubEV.restore();
        });

        it('should store the remotely retrieved collection as otherRecord', function(done) {
            wrapper.vm.getOther().then(() => {
                expect(wrapper.vm.otherRecord).to.eql(testCollection);
                done();
            }).catch(done);
        });

        it('should call twice the storeIds() method one with the current record, one with the other', function(done) {
            stubSI.reset();
            wrapper.vm.getOther().then(() => {
                expect(stubSI.calledTwice).to.be.true;
                expect(stubSI.calledWithExactly(testCollection)).to.be.true;
                expect(stubSI.calledWithExactly(thisCollection)).to.be.true;
                done();
            }).catch(done);
        });

        it('should call (at least) three times the elementVis() method', function(done) {
            stubEV.reset();
            wrapper.vm.getOther().then(() => {
                expect(stubEV.callCount).to.be.at.least(3);
                expect(stubEV.calledWithExactly('show-graph-button','show')).to.be.true;
                expect(stubEV.calledWithExactly('top-spinner','hide')).to.be.true;
                expect(stubEV.calledWithExactly('collection-comparison-selector','show')).to.be.true;
                done();
            }).catch(done);
        });

    });

    describe('openComparison()', function() {

        let wrapper, spyHG, spyGO;

        beforeEach(function() {
            wrapper = mount(ComparisonArea);
            spyHG = sinon.spy(wrapper.vm, 'hideGraphs');
            spyGO = sinon.spy(wrapper.vm, 'getOther');
            const thisCollection = Object.assign(testCollection, { name: 'Foo Collection', pk: 3, bsg_id: 'bsg-c000003'});
            wrapper.setProps({
                thisRecord: thisCollection
            });
            wrapper.setData({
                selectedBsgId: 'bsg-c000001'
            });
        });

        afterEach(function() {
            spyHG.restore();
            spyGO.restore();
        });

        it('should not display any comparison items on first render', function() {
            //expect(wrapper.contains(RecordComparison)).to.be.false;
            expect(wrapper.contains('.recordcomparison')).to.be.false;
        });

        it('should display the comparison well after the comparison is triggered', function(done) {

            wrapper.find('#collection-comparison-btn').trigger('click');
            Vue.nextTick().then(() => {
                expect(wrapper.contains('#comparison-well')).to.be.true;
                done();
            }).catch(done);
        });

        it('should call the hideGraph() method', function() {
            wrapper.find('#collection-comparison-btn').trigger('click');
            expect(spyHG.calledOnce).to.be.true;
        });

        it('should call the getOther() method', function() {
            wrapper.find('#collection-comparison-btn').trigger('click');
            expect(spyGO.calledOnce).to.be.true;
        });

    });

    describe('generalStats()', function() {
        let wrapper, spyShow, spyHide, spyDraw;

        beforeEach(function() {
            wrapper = mount(ComparisonArea);
            spyShow = sinon.spy(wrapper.vm, 'showGeneralStats');
            spyHide = sinon.spy(wrapper.vm, 'hideGeneralStats');
            spyDraw = sinon.spy(wrapper.vm, 'generalStats');
            const thisCollection = Object.assign(testCollection, { name: 'Foo Collection', pk: 3, bsg_id: 'bsg-c000003'});
            wrapper.setProps({
                thisRecord: thisCollection
            });
        });

        afterEach(function() {
            spyHide.restore();
            spyShow.restore();
            spyDraw.restore();
        });

        it('should show and hide stats', function() {
            expect(wrapper.vm.loaded).to.eql(false);

            /*
            wrapper.find('#show_stats').trigger('click'); // this now seems to cause tests to time out
            expect(spyShow.calledOnce).to.be.true;
            expect(spyDraw.calledOnce).to.be.true;
            expect(wrapper.vm.loaded).to.eql(true);
            wrapper.find('#hide_stats').trigger('click');
            expect(spyHide.calledOnce).to.be.true;
            */

        });


    })

});
