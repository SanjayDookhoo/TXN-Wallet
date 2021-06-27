import * as actionType from '../constants/actionTypes';

const initial_state = {
	loaded: false,
	is_mobile_app: true,
};

const app = (state = initial_state, action) => {
	switch (action.type) {
		case actionType.UPDATE_APP: {
			return {
				...state,
				...action.payload,
			};
		}
		default:
			return state;
	}
};

export default app;
