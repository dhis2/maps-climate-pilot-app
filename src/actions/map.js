import * as types from '../constants/actionTypes';

// Load one map favorite
export const loadMap = (id) => ({
  type: types.MAP_LOAD,
  id,
});

export const setMap = (config) => ({
    type: types.MAP_SET,
    payload: config,
});

export const openCoordinatePopup = (coord) => ({
    type: types.MAP_COORDINATE_OPEN,
    payload: coord,
});

export const closeCoordinatePopup = (coord) => ({
    type: types.MAP_COORDINATE_CLOSE,
});

export const openContextMenu = (payload) => ({
    type: types.MAP_CONTEXT_MENU_OPEN,
    payload,
});

export const closeContextMenu = () => ({
    type: types.MAP_CONTEXT_MENU_CLOSE,
});