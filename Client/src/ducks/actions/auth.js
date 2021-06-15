import * as actionType from '../constants/actionTypes';
import * as api from '../api/index.js';

export const signIn = (formData, router) => async (dispatch) => {
	try {
		const { data } = await api.signIn(formData);

		dispatch({ type: actionType.AUTH, payload: data });

		router.push('/');
	} catch (error) {
		console.log(error);
	}
};

export const signUp = (formData, router) => async (dispatch) => {
	try {
		const { data } = await api.signUp(formData);

		dispatch({ type: actionType.AUTH, payload: data });

		router.push('/');
	} catch (error) {
		console.log(error);
	}
};

export const signOut = (router) => async (dispatch) => {
	try {
		dispatch({ type: actionType.SIGN_OUT });

		router.push('/auth');
	} catch (error) {
		console.log(error);
	}
};
