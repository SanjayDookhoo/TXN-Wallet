import express from 'express';
import sequelize from 'sequelize';
import { base_models } from '../models/other.js';

// console.log(base_models);

const general = async (req, res) => {
	const sequelize_session = new sequelize(
		process.env.DATABASE_NAME,
		process.env.DATABASE_USERNAME,
		process.env.DATABASE_PASSWORD,
		{
			host: process.env.DATABASE_HOST,
			dialect: 'mysql',
			define: {
				timestamps: false,
			},
			logging: false,
		}
	);

	const { baseUrl, method, body } = req;
	const query_obj = req.query;
	const table_name = baseUrl.substring(1); // strips out first character forward slash

	if (method === 'GET') {
		const _childrenTables = (parent_table_name) => {
			return Object.entries(base_models)
				.filter(
					([table_name, table_meta]) =>
						table_meta?._foreign_key?.table === parent_table_name
				)
				.map(([table_name, table_meta]) => table_name);
		};

		const _getDirectchildrenTables = async ({
			result,
			parent_table_name,
		}) => {
			const children_tables = _childrenTables(parent_table_name);
			// console.log(children_tables);
			children_tables.forEach((children_table) => {
				result[children_table] = [];
			});

			let filter = '';
			const temp = result[parent_table_name].map((records) => records.id);

			// if (temp.length !== 0) {
			// if no records were found, then there is no information to use to search with
			temp.forEach((value, i) => {
				if (i !== 0) {
					filter += ' or ';
				}
				filter += `${parent_table_name}_id="${value}"`;
			});
			// console.log({ filter });

			const promises = children_tables.map((table_name) => {
				const query = `SELECT * FROM ${table_name} ${
					temp.length !== 0 ? 'WHERE' : ''
				} ${filter}`;
				return sequelize_session.query(query, {
					type: sequelize.QueryTypes.SELECT,
				});
			});

			const temp_arr = await Promise.all(promises);
			children_tables.forEach((children_table, i) => {
				result[children_table] = temp_arr[i];
			});
			// }
		};

		const _getRootTable = async ({ result, table_name }) => {
			let filter = '';
			Object.entries(query_obj).forEach(([field, value], i) => {
				if (i !== 0) {
					filter += ' and ';
				}
				filter += `${field}="${value}"`;
			});
			// console.log(filter);

			let query = `SELECT * FROM ${table_name}`; // constructed in such a way that if no params is passed, gets all
			if (filter !== '')
				query += ` WHERE ${filter} and created_by_user=${req.user_id}`;
			// console.log({query});
			const selected = await sequelize_session.query(query, {
				type: sequelize.QueryTypes.SELECT,
			});

			result[table_name] = selected;
		};

		try {
			let result = {};
			let temp;
			await _getRootTable({
				result,
				table_name,
			});
			await _getDirectchildrenTables({
				result,
				parent_table_name: table_name,
			});

			// use _getDirectchildrenTables specific to a call, could not get recursive soln working, quick fall back
			switch (table_name) {
				case 'customers':
					break;

				default:
					break;
			}

			res.status(200).json({ result });
		} catch (err) {
			console.log(err);
			res.status(500).json({ message: 'Something Went Wrong' });
		}
	} else if (method === 'POST') {
		if (body.inserts && body.inserts.length !== 0) {
			const transaction = await sequelize_session.transaction();
			try {
				const promises = body.inserts.map((insert) => {
					let columns = '';
					let values = '';

					const insert_w_extra = {
						...insert,
						created_by_user: req.user_id,
					};
					Object.entries(insert_w_extra).forEach(
						([field, value], i) => {
							if (i !== 0) {
								columns += ' , ';
								values += ' , ';
							}
							columns += `${field}`;
							values += `"${value}"`;
						}
					);
					// console.log({ columns, values });
					const query = `INSERT INTO ${table_name} (${columns}) VALUES (${values})`;
					// console.log({query})
					return sequelize_session.query(query, {
						type: sequelize.QueryTypes.INSERT,
						transaction,
					});
				});

				const temp_arr = await Promise.all(promises);
				const data = temp_arr.map((temp) => ({
					id: temp[0],
				}));

				await transaction.commit();
				res.status(200).json({ result: data });
			} catch (err) {
				console.log(err);
				transaction.rollback();
				res.status(500).json({ message: 'Something Went Wrong' });
			}
		} else {
			res.status(500).json({ result: 'No creates specified' });
		}
	} else if (method === 'PATCH') {
		if (body.updates && body.updates.length !== 0) {
			const transaction = await sequelize_session.transaction();
			try {
				const promises = Object.entries(body.updates).map(
					([id, id_updates]) => {
						if (Object.entries(id_updates).length !== 0) {
							let set = '';

							Object.entries(id_updates).forEach(
								([field, value], i) => {
									if (i !== 0) {
										set += ' , ';
									}
									set += `${field}="${value}"`;
								}
							);
							// console.log({ set });
							const query = `UPDATE ${table_name} SET ${set} WHERE id=${id} and created_by_user=${req.user_id}`;
							// console.log({query})
							return sequelize_session.query(query, {
								type: sequelize.QueryTypes.UPDATE,
								transaction,
							});
						}
					}
				);

				await Promise.all(promises);

				await transaction.commit();
				res.status(200).json({ result: 'Updated Successfully' });
			} catch (err) {
				console.log(err);
				transaction.rollback();
				res.status(500).json({ message: 'Something Went Wrong' });
			}
		} else {
			res.status(500).json({ result: 'No updates specified' });
		}
	} else if (method === 'DELETE') {
		if (body.ids && body.ids.length !== 0) {
			let filter = '';
			body.ids.forEach((id, i) => {
				if (i !== 0) {
					filter += ' or ';
				}
				filter += `id=${id}`;
			});
			// console.log(filter);

			const transaction = await sequelize_session.transaction();
			try {
				const query = `DELETE FROM ${table_name} WHERE ${filter} and created_by_user=${req.user_id}`;
				// console.log({query})
				const deleted = await sequelize_session.query(query, {
					type: sequelize.QueryTypes.DELETE,
					transaction,
				});

				await transaction.commit();
				res.status(200).json({ result: 'Deleted Successfully' });
			} catch (err) {
				console.log(err);
				transaction.rollback();
				res.status(500).json({ message: 'Something Went Wrong' });
			}
		} else {
			res.status(500).json({ result: 'No ids specified' });
		}
	}
};

export default general;
