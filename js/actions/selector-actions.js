/**
 * @author massi
 */
import * as types from './action-types';

export function  getGraphSuccess(selected) {
    return {
        type: types.LAYOUT_SELECT_CHANGE,
        selected
    };
}