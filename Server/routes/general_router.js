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
		}
	);

	const { baseUrl, method, body } = req;
	const table_name = baseUrl.substring(1); // strips out first character forward slash

	if (method === 'GET') {
		const _recursiveRetrievalOfChildren = ({
			result,
			parent_table_name,
		}) => {
			console.log({ parent_table_name });
			const children_tables = Object.entries(base_models)
				.filter(
					([table_name, table_meta]) =>
						table_meta?._foreign_key?.table === parent_table_name
				)
				.map(([table_name, table_meta]) => table_name + 's');
			console.log(children_tables);
		};

		if (body.filters && Object.entries(body.filters).length !== 0) {
			try {
				const result = {};
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

				_recursiveRetrievalOfChildren({
					result,
					parent_table_name: table_name.slice(0, -1),
				});

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
				body.inserts.forEach(async (insert) => {
					let columns = '';
					let values = '';

					Object.entries(insert).forEach(
						async ([field, value], i) => {
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
					const inserted = await sequelize_session.query(query, {
						type: sequelize.QueryTypes.INSERT,
					});
				});

				res.status(200).json({ result: 'Created Successfully' });
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
							async ([field, value], i) => {
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
