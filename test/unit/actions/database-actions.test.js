import { expect } from 'chai';

import * as types from '../../../js/actions/action-types';
import * as actions from '../../../js/actions/database-actions';
import testDatabase from '../../fixtures/database.json';


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

});
