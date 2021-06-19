import * as actionType from '../constants/actionTypes';

const initial_state = {
	loaded: false,
	scanning: false,
	dashboard_item: '',
};

const app = (state = initial_state, action) => {
	switch (action.type) {
		case actionType.ROUTE_STATE_APP: {
			const { path } = action.payload;

			switch (path) {
				case '/':
					return {
						...initial_state,
						loaded: true,
					};
				case '/active':
					if (state.loaded) {
						return {
							...state,
							scanning: false,
						};
					} else {
						return {
							...initial_state,
							loaded: true,
						};
					}
				case '/scanning':
					if (state.loaded) {
						return {
							...state,
							scanning: true,
						};
					} else {
						return {
							...initial_state,
							loaded: true,
						};
					}
				default:
					return initial_state;
			}
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
