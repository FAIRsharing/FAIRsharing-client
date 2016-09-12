import { BIOSHARING_ENTITIES, TAG_TYPES, DEPTH_LEVELS } from '../js/utils/api-constants';
import _ from 'lodash';

// GRAPH constants
export const visibilityObj = {};
_.values(BIOSHARING_ENTITIES).forEach(entity => visibilityObj[entity.value] = _.zipObject(DEPTH_LEVELS, _.map(DEPTH_LEVELS, () => true)));

export const tagSelectorObj = {};
_.values(TAG_TYPES).forEach(tagType => tagSelectorObj[tagType.value] = tagType.initialState);
