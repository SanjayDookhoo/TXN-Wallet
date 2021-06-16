import * as actionType from '../constants/actionTypes';
import * as api from '../api/index.js';

// as of right now only the dispatch statement differs for all actions, may need to change later

export const databaseGet =
	({ table_name, req_params, onSuccess, onFailure }) =>
	async (dispatch) => {
		try {
			const { data } = await api.databaseGet({
				table_name,
				req_params,
			});

			dispatch({
				type: actionType.GET,
				payload: { table_name, req_params, res: data },
			});

			if (onSuccess) onSuccess();
		} catch (error) {
			console.log(error);
			if (onFailure) onFailure(error);
		}
	};

export const databasePost =
	({ table_name, req_body, onSuccess, onFailure }) =>
	async (dispatch) => {
		try {
			const { data } = await api.databasePost({
				table_name,
				req_body,
			});

			dispatch({
				type: actionType.POST,
				payload: { table_name, req_body, res: data },
			});

			if (onSuccess) onSuccess();
		} catch (error) {
			console.log(error);
			if (onFailure) onFailure(error);
		}
	};

export const databasePatch =
	({ table_name, req_body, onSuccess, onFailure }) =>
	async (dispatch) => {
		try {
			const { data } = await api.databasePatch({
				table_name,
				req_body,
			});

			dispatch({
				type: actionType.PATCH,
				payload: { table_name, req_body, res: data },
			});

			if (onSuccess) onSuccess();
		} catch (error) {
			console.log(error);
			if (onFailure) onFailure(error);
		}
	};

export const databaseDelete =
	({ table_name, req_body, onSuccess, onFailure }) =>
	async (dispatch) => {
		try {
			const { data } = await api.databaseDelete({
				table_name,
				req_body,
			});

			dispatch({
				type: actionType.DELETE,
				payload: { table_name, req_body, res: data },
			});

			if (onSuccess) onSuccess();
		} catch (error) {
			console.log(error);
			if (onFailure) onFailure(error);
		}
	};
