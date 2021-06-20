import * as actionType from '../constants/actionTypes';

const initial_state = {
	loaded: false,
	scanning: false,
	dashboard_item: '',
	is_mobile_app: true,
};

const app = (state = initial_state, action) => {
	switch (action.type) {
		case actionType.ROUTE_STATE_APP: {
			const { path, is_mobile_app } = action.payload;
			console.log(action.payload);

			let new_state = { ...initial_state };

			switch (path) {
				case '/active':
					if (state.loaded) {
						new_state = {
							...state,
							scanning: false,
						};
					}
					break;
				case '/scanning':
					if (state.loaded) {
						new_state = {
							...state,
							scanning: true,
						};
					}
					break;
				default:
					new_state = {
						...initial_state,
					};
					break;
			}
			return {
				...new_state,
				loaded: true,
				is_mobile_app,
			};
		}
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
