import { expect } from 'chai';

import * as types from '../../../js/actions/action-types';
import * as actions from '../../../js/actions/main-actions';

describe('main-actions', () => {

    describe('sendRemoteRequest', () => {
        it('should create an action to notify that is fetching the graph remotely', () => {
            const expectedAction = {
                type: types.SEND_REMOTE_REQUEST
            };
            expect(actions.sendRemoteRequest()).to.eql(expectedAction);
        });
    });

    describe('getGraphError', () => {
        it('should create an action to instantiate a new graph', () => {
            const error = '500 Internal Server Error';
            const expectedAction = {
                type: types.GET_REMOTE_ERROR,
                error
            };
            expect(actions.getRemoteError(error)).to.eql(expectedAction);
        });
    });

});
