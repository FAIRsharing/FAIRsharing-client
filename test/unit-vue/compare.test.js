import Vue from 'vue';
import { expect } from 'chai';
import { mount, shallow } from 'vue-test-utils';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
//import sinon from 'sinon';
import CollectionCompareMain from '../../js-vue/compare';

const collectionListApiResponse = {
    count: 3,
    previous: null,
    results: [
        {
            pk: 1,
            bsg_id: 'bsg-c000001',
            name: 'Scientific Rockers',
            description: 'A biological rock',
            recommendation: true
        },
        {
            pk: 2,
            bsg_id: 'bsg-c000002',
            name: 'NIPPO-supported data repositories',
            description: 'A something',
            recommendation: false
        },
        {
            pk: 3,
            bsg_id: 'bsg-c000003',
            name: 'TBGDE Biodiversity Info Standards',
            description: 'Not a nothing',
            recommendation: false
        }
    ]
};

const expectedCollections = [
    {
        pk: 2,
        bsgId: 'bsg-c000002',
        label: 'NIPPO-supported data repositories'
    },
    {
        pk: 1,
        bsgId: 'bsg-c000001',
        label: 'Scientific Rockers'
    },
    {
        pk: 3,
        bsgId: 'bsg-c000003',
        label: 'TBGDE Biodiversity Info Standards'
    }
];

describe('<CompareMain />', function() {

    let mock;

    before(function() {
        mock = new MockAdapter(axios);

        mock.onGet('/api/collection/summary/').reply(200, collectionListApiResponse);

        mock.onGet(/\/api\/collection\/bsg-c\d{6}/).reply(config  => {
            console.log(config);
            return [200, {}];
        });
    });

    after(function() {
        mock.restore();
    });

    describe('data()', function() {
        it('sets the correct default data', function() {
            expect(typeof CollectionCompareMain.data).to.equal('function');
            const defaultData = CollectionCompareMain.data();
            expect(defaultData.collections).to.eql([]);
            expect(defaultData.currentCollection).to.eql({});
            expect(defaultData.apiKey).to.equal(null);
            expect(defaultData.currentCollectionId).to.equal(null);
        });
    });

    describe('getCollections()', function() {

        it('correctly sets the collections property', function(done) {
            const wrapper = shallow(CollectionCompareMain);
            expect(wrapper.vm.collections).to.eql([]);
            wrapper.setData({
                currentCollectionId: 'bsg-c000001'
            });
            // expect(wrapper.hasProp('collections', [])).to.be.true;
            wrapper.vm.getCollections().then(() => {
                const actualCollections = wrapper.vm.collections;
                expect(actualCollections).to.eql(expectedCollections);
                /*
                expect(actualCollections.length).to.eql(expectedCollections.length);
                for (let i=0; i < actualCollections.length; i++) {
                    expect(actualCollections[i].pk).to.equal(expectedCollections[i].pk);
                    expect(actualCollections[i].bsgId).to.equal(expectedCollections[i].bsgId);
                    expect(actualCollections[i].label).to.equal(expectedCollections[i].label);
                } */
                done();
            }).catch(done);
        });

    });

});
