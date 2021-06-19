import * as actionType from '../constants/actionTypes';

export const routeStateApp =
	({ path }) =>
	(dispatch) => {
		console.log('test');
		try {
			dispatch({ type: actionType.ROUTE_STATE_APP, payload: { path } });
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
