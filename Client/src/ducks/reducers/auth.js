import * as actionType from '../constants/actionTypes';

const authReducer = (state = { authData: null }, action) => {
	switch (action.type) {
		case actionType.AUTH: {
			localStorage.setItem(
				'profile',
				JSON.stringify({ ...action?.payload })
			);

			return {
				...state,
				authData: action.payload,
				loading: false,
				errors: null,
			};
		}
		case actionType.SIGN_OUT: {
			localStorage.clear();

			return { ...state, authData: null, loading: false, errors: null };
		}
		default:
			return state;
	}
};

export default authReducer;
