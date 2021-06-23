import * as actionType from '../constants/actionTypes';
import { base_models } from './database_base_models';

const database = (state = {}, action) => {
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
			// if (!new_state[table_name]) {
			// 	new_state[table_name] = {};
			// }

			result.forEach((record_appended_data, i) => {
				new_state[table_name][record_appended_data.id] = {
					...record_appended_data,
					...req_body.inserts[i],
				};
			});

			return new_state;
		}
		case actionType.PATCH: {
			const { result } = action.payload.res;
			const { table_name, req_body } = action.payload;

			const new_state = {
				...state,
			};

			Object.entries(req_body.updates).forEach(([id, update]) => {
				new_state[table_name][id] = {
					...new_state[table_name][id],
					...update,
				};
			});

			return new_state;
		}
		case actionType.DELETE: {
			const { result } = action.payload.res;
			const { table_name, req_body } = action.payload;

			const new_state = {
				...state,
			};

			// req_body.ids.forEach((id) => {
			// 	delete new_state[table_name][id];
			// });

			// recursively delete from main table, and ALL related tables
			const _recursiveDelete = ({ table_name, ids }) => {
				ids.forEach((id) => {
					delete new_state[table_name][id];
				});

				// other tables directly related to this table
				const direct_children_tables = Object.entries(base_models)
					.filter(
						([
							direct_children_table_name,
							direct_children_table_meta,
						]) =>
							direct_children_table_meta?._foreign_key?.table ===
								table_name &&
							direct_children_table_meta?._foreign_key
								?.on_delete === 'cascade'
					)
					.map(
						([
							direct_children_table_name,
							direct_children_table_meta,
						]) => direct_children_table_name
					);

				direct_children_tables.forEach((direct_children_table) => {
					const direct_children_table_ids = Object.values(
						new_state[direct_children_table]
					)
						.filter((direct_children_table_record) => {
							console.log({ direct_children_table_record });
							return ids.includes(
								direct_children_table_record[
									`${table_name.slice(0, -1)}_id`
								]
							);
						})
						.map(
							(direct_children_table_record) =>
								direct_children_table_record.id
						);

					_recursiveDelete({
						table_name: direct_children_table,
						ids: direct_children_table_ids,
					});
				});
			};

			_recursiveDelete({ table_name, ids: req_body.ids });

			return new_state;
		}
		default:
			return state;
	}
};

export default database;
