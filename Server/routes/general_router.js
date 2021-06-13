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
	} else if (method === 'POST') {
	} else if (method === 'PATCH') {
		if (body.updates.length !== 0) {
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
						console.log({ set });
						const updated = await sequelize_session.query(
							`UPDATE ${table_name} SET ${set} WHERE id=${id}`,
							{ type: sequelize.QueryTypes.UPDATE }
						);
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
		if (body.ids.length !== 0) {
			let filter = '';
			body.ids.forEach((id, i) => {
				if (i !== 0) {
					filter += ' or ';
				}
				filter += `id=${id}`;
			});
			console.log(filter);

			try {
				const deleted = await sequelize_session.query(
					`DELETE FROM ${table_name} WHERE ${filter}`,
					{ type: sequelize.QueryTypes.DELETE }
				);

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
