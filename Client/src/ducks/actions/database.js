import * as actionType from '../constants/actionTypes';
import * as databaseApi from '../api/database.js';

// as of right now only the dispatch statement differs for all actions, may need to change later

export const databaseGet =
	({ table_name, req_params, onSuccess, onFailure }) =>
	async (dispatch) => {
		try {
			const { data } = await databaseApi.databaseGet({
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
			const { data } = await databaseApi.databasePost({
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
			const { data } = await databaseApi.databasePatch({
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
			const { data } = await databaseApi.databaseDelete({
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
