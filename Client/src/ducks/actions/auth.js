import * as actionType from '../constants/actionTypes';
import * as api from '../api/index.js';

export const signIn =
	({ form_data, onSuccess, onFailure }) =>
	async (dispatch) => {
		try {
			const { data } = await api.signIn(form_data);

			dispatch({ type: actionType.AUTH, payload: data });

			if (onSuccess) onSuccess();
		} catch (error) {
			console.log(error);
			if (onFailure) onFailure(error);
		}
	};

export const signUp =
	({ form_data, onSuccess, onFailure }) =>
	async (dispatch) => {
		try {
			const { data } = await api.signUp(form_data);

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
