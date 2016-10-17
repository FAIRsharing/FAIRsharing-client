import { expect } from 'chai';

import * as types from '../../../js/actions/action-types';
import * as actions from '../../../js/actions/database-actions';
import testDatabase from '../../fixtures/database.json';
import testTags from '../../fixtures/tags.json';


describe('database-actions', () => {

    describe('getDatabaseSuccess', () => {
        it('should create an action to register the incoming database', () => {
            const database = testDatabase;
            const expectedAction = {
                type: types.GET_DATABASE_SUCCESS,
                database
            };
            expect(actions.getDatabaseSuccess(database)).to.eql(expectedAction);
        });
    });

    describe('getTagsSuccess', () => {
        it('should create an action to register the incoming tags', () => {
            const tags = testTags;
            const expectedAction = {
                type: types.GET_TAGS_SUCCESS,
                tags
            };
            expect(actions.getTagsSuccess(tags)).to.eql(expectedAction);
        });
    });

});
