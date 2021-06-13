import express from 'express';
import sequelize from 'sequelize';
import { base_models } from '../models.js';

// console.log(base_models);

const general_router = async (req, res) => {
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
	const table_name = baseUrl.substring(1); // strips out first character forward slash

	if (method === 'GET') {
		if (body.filters) {
			const _childrenTables = (parent_table_name) => {
				return Object.entries(base_models)
					.filter(
						([table_name, table_meta]) =>
							table_meta?._foreign_key?.table ===
							parent_table_name.slice(0, -1)
					)
					.map(([table_name, table_meta]) => table_name + 's');
			};

			const _getDirectchildrenTables = async ({
				result,
				parent_table_name,
			}) => {
				const children_tables = _childrenTables(parent_table_name);
				console.log(children_tables);

				let filter = '';
				const temp = result[parent_table_name].map(
					(records) => records.id
				);
				temp.forEach((value, i) => {
					if (i !== 0) {
						filter += ' or ';
					}
					filter += `${parent_table_name.slice(0, -1)}_id="${value}"`;
				});
				// console.log({ filter });

				const promises = children_tables.map((table_name) => {
					// const query = `SELECT * FROM ${table_name} WHERE ${filter}`;
					const query = `SELECT * FROM ${table_name} WHERE ${filter}`;
					return sequelize_session.query(query, {
						type: sequelize.QueryTypes.SELECT,
					});
				});

				const temp_arr = await Promise.all(promises);
				children_tables.forEach((children_table, i) => {
					result[children_table] = temp_arr[i];
				});
			};

			const _getRootTable = async ({ result, table_name }) => {
				let filter = '';
				Object.entries(body.filters).forEach(([field, value], i) => {
					if (i !== 0) {
						filter += ' and ';
					}
					filter += `${field}="${value}"`;
				});
				// console.log(filter);

				const query = `SELECT * FROM ${table_name} WHERE ${filter}`;
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
		} else {
			res.status(500).json({ result: 'No filters specified' });
		}
	} else if (method === 'POST') {
		if (body.inserts && body.inserts.length !== 0) {
			try {
				const promises = body.inserts.map((insert) => {
					let columns = '';
					let values = '';

					Object.entries(insert).forEach(([field, value], i) => {
						if (i !== 0) {
							columns += ' , ';
							values += ' , ';
						}
						columns += `${field}`;
						values += `"${value}"`;
					});
					// console.log({ columns, values });
					const query = `INSERT INTO ${table_name} (${columns}) VALUES (${values})`;
					// console.log({query})
					return sequelize_session.query(query, {
						type: sequelize.QueryTypes.INSERT,
					});
				});

				const temp_arr = await Promise.all(promises);
				const data = temp_arr.map((temp) => ({
					id: temp[0],
				}));

				res.status(200).json({ result: data });
			} catch (err) {
				console.log(err);
				res.status(500).json({ message: 'Something Went Wrong' });
			}
		} else {
			res.status(500).json({ result: 'No creates specified' });
		}
	} else if (method === 'PATCH') {
		if (body.updates && body.updates.length !== 0) {
			try {
				Object.entries(body.updates).forEach(
					async ([id, id_updates]) => {
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
						const query = `UPDATE ${table_name} SET ${set} WHERE id=${id}`;
						// console.log({query})
						const updated = await sequelize_session.query(query, {
							type: sequelize.QueryTypes.UPDATE,
						});
					}
				);

				res.status(200).json({ result: 'Updated Successfully' });
			} catch (err) {
				console.log(err);
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

			try {
				const query = `DELETE FROM ${table_name} WHERE ${filter}`;
				// console.log({query})
				const deleted = await sequelize_session.query(query, {
					type: sequelize.QueryTypes.DELETE,
				});

				res.status(200).json({ result: 'Deleted Successfully' });
			} catch (err) {
				console.log(err);
				res.status(500).json({ message: 'Something Went Wrong' });
			}
		} else {
			res.status(500).json({ result: 'No ids specified' });
		}
	}
};

export default general_router;
