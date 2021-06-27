import * as actionType from '../constants/actionTypes';
import * as databaseApi from '../api/database.js';

export const signIn =
	({ req_body, onSuccess, onFailure }) =>
	async (dispatch) => {
		try {
			const { data } = await databaseApi.signIn({ req_body });

			dispatch({ type: actionType.AUTH, payload: data });

			if (onSuccess) onSuccess(data);
		} catch (error) {
			console.log(error);
			if (onFailure) onFailure(error);
		}
	};

export const signUp =
	({ req_body, onSuccess, onFailure }) =>
	async (dispatch) => {
		try {
			const { data } = await databaseApi.signUp({ req_body });

			dispatch({ type: actionType.AUTH, payload: data });

			if (onSuccess) onSuccess(data);
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
