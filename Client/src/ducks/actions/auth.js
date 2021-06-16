import * as actionType from '../constants/actionTypes';
import * as api from '../api/index.js';

export const signIn =
	({ req_body, onSuccess, onFailure }) =>
	async (dispatch) => {
		try {
			const { data } = await api.signIn({ req_body });

			dispatch({ type: actionType.AUTH, payload: data });

			if (onSuccess) onSuccess();
		} catch (error) {
			console.log(error);
			if (onFailure) onFailure(error);
		}
	};

export const signUp =
	({ req_body, onSuccess, onFailure }) =>
	async (dispatch) => {
		try {
			const { data } = await api.signUp({ req_body });

			dispatch({ type: actionType.AUTH, payload: data });

			if (onSuccess) onSuccess();
		} catch (error) {
			console.log(error);
			if (onFailure) onFailure(error);
		}
	};

export const signOut =
	({ onSuccess, onFailure }) =>
	async (dispatch) => {
		try {
			dispatch({ type: actionType.SIGN_OUT });

			if (onSuccess) onSuccess();
		} catch (error) {
			console.log(error);
			if (onFailure) onFailure(error);
		}
	};
