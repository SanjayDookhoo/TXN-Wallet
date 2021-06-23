import * as actionType from '../constants/actionTypes';

export const routeStateApp = (data) => (dispatch) => {
	try {
		dispatch({ type: actionType.ROUTE_STATE_APP, payload: data });
	} catch (error) {
		console.log(error);
	}
};

export const updateApp = (updates) => (dispatch) => {
	try {
		dispatch({ type: actionType.UPDATE_APP, payload: updates });
	} catch (error) {
		console.log(error);
	}
};
