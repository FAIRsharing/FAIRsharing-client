/**
 * @author massi
 */
import * as types from '../actions/action-types';
import { COLA_LAYOUT } from '../utils/api-constants';

const initialState = {
    selected: COLA_LAYOUT
};

const selectorReducer = function (state, action) {

    switch (action.type) {

        case types.LAYOUT_SELECT_CHANGE:
            return { ...state, selected: action.selected };

    }

    return state;

};

export default selectorReducer;
