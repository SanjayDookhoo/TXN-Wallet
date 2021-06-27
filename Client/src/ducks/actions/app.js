import * as actionType from '../constants/actionTypes';

export const updateApp = (updates) => (dispatch) => {
	try {
		dispatch({ type: actionType.UPDATE_APP, payload: updates });
	} catch (error) {
		console.log(error);
	}
};
