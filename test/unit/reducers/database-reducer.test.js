import { expect } from 'chai';
import databaseReducer, { initialState } from '../../../js/reducers/database-reducer';
import * as types from '../../../js/actions/action-types';
import testDatabase from '../../fixtures/database.json';

describe('databaseReducer', () => {

    it('should return the initial state', () => {

        expect(databaseReducer(undefined, {})).to.eql(initialState);

    });

    it('should handle the SEND_REMOTE_REQUEST event', () => {
        const nextState = databaseReducer(undefined, {
            type: types.SEND_REMOTE_REQUEST
        });

        const expectedState = {
            ...initialState,
            isFetching: true
        };

        expect(nextState).to.eql(expectedState);

    });

    it('should handle the GET_DATABASE_SUCCESS event', () => {
        const nextState = databaseReducer(undefined, {
            type: types.GET_DATABASE_SUCCESS,
            database: testDatabase
        });
        const expectedState = {
            ...initialState,
            database: testDatabase,
            isFetching: false
        };
        expect(nextState).to.eql(expectedState);
    });

    it('should handle the GET_REMOTE_ERROR event', () => {
        const nextState = databaseReducer(initialState, {
            type: types.GET_REMOTE_ERROR,
            error: 'NOT FOUND'
        });
        const expectedState = {
            ...initialState,
            isFetching: false,
            error: 'NOT FOUND'
        };
        expect(nextState).to.eql(expectedState);
    });

});
