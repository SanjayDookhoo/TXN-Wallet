import * as actionType from '../constants/actionTypes';

const auth = (state = { user: null }, action) => {
	switch (action.type) {
		case actionType.AUTH: {
			localStorage.setItem(
				'profile',
				JSON.stringify({ ...action?.payload })
			);

			return {
				...state,
				user: action.payload,
				loading: false,
				errors: null,
			};
		}
		case actionType.SIGN_OUT: {
			localStorage.clear();

			return { ...state, user: null, loading: false, errors: null };
		}
		default:
			return state;
	}
};

export default auth;
