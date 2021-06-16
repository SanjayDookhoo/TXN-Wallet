import * as actionType from '../constants/actionTypes';
import { base_models } from './database_base_models';

const database = (state = {}, action) => {
	console.log({ payload: action.payload });

	switch (action.type) {
		case actionType.GET: {
			const { result } = action.payload.res;

			const new_state = {
				...state,
			};

			Object.entries(result).forEach(([table_name, table_records]) => {
				new_state[table_name] = Object.fromEntries(
					table_records.map((table_record) => [
						table_record.id,
						table_record,
					])
				);
			});

			return new_state;
		}
		case actionType.POST: {
			const { result } = action.payload.res;
			const { table_name, req_body } = action.payload;

			const new_state = {
				...state,
			};

			// should never try to insert into a table that doesnt yet exist, but just incase
			if (!new_state[table_name]) {
				new_state[table_name] = {};
			}

			result.forEach((record_appended_data, i) => {
				new_state[table_name][record_appended_data.id] = {
					...record_appended_data,
					...req_body.inserts[i],
				};
			});

			return new_state;
		}
		case actionType.PATCH: {
		}
		case actionType.DELETE: {
		}
		default:
			return state;
	}
};

export default database;
