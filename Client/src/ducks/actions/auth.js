import * as actionType from '../constants/actionTypes';
import * as api from '../api/index.js';

export const signIn =
	({ form_data, history, onSuccess, onFailure }) =>
	async (dispatch) => {
		try {
			const { data } = await api.signIn(form_data);

			dispatch({ type: actionType.AUTH, payload: data });

			history.push('/');
			if (onSuccess) onSuccess();
		} catch (error) {
			console.log(error);
			if (onFailure) onFailure(error);
		}
	};

export const signUp =
	({ form_data, history, onSuccess, onFailure }) =>
	async (dispatch) => {
		try {
			const { data } = await api.signUp(form_data);

			dispatch({ type: actionType.AUTH, payload: data });

			history.push('/');
			if (onSuccess) onSuccess();
		} catch (error) {
			console.log(error);
			if (onFailure) onFailure(error);
		}
	};

export const signOut =
	({ history, onSuccess, onFailure }) =>
	async (dispatch) => {
		try {
			dispatch({ type: actionType.SIGN_OUT });

			history.push('/auth');
			if (onSuccess) onSuccess();
		} catch (error) {
			console.log(error);
			if (onFailure) onFailure(error);
		}
	};
