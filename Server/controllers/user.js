import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sequelize from 'sequelize';

const getSequelizeSession = () => {
	return new sequelize(
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
};

export const signIn = async (req, res) => {
	const sequelize_session = getSequelizeSession();
	console.log('**signin');
	const { email, password } = req.body;

	try {
		let query;
		query = `SELECT * FROM users WHERE email="${email}"`;
		// console.log({query})
		const old_users = await sequelize_session.query(query, {
			type: sequelize.QueryTypes.SELECT,
		});
		const old_user = old_users.length !== 0 ? old_users[0] : null;

		if (!old_user)
			return res.status(404).json({ message: "User doesn't exist" });

		const is_password_correct = await bcrypt.compare(
			password,
			old_user.password
		);

		if (!is_password_correct)
			return res.status(400).json({ message: 'Invalid credentials' });

		const token = jwt.sign(
			{ email: old_user.email, id: old_user.id },
			process.env.JWT_SECRET,
			{ expiresIn: '1h' }
		);

		res.status(200).json({ result: old_user, token });
	} catch (err) {
		res.status(500).json({ message: 'Something went wrong' });
	}
};

export const signUp = async (req, res) => {
	const sequelize_session = getSequelizeSession();
	console.log('**signUp');

	const { email, password } = req.body;

	const transaction = await sequelize_session.transaction();
	try {
		let query;
		query = `SELECT * FROM users WHERE email="${email}"`;
		// console.log({query})
		const old_users = await sequelize_session.query(query, {
			type: sequelize.QueryTypes.SELECT,
		});
		const old_user = old_users.length !== 0 ? old_users[0] : null;

		if (old_user)
			return res.status(400).json({ message: 'User already exists' });

		const hashed_password = await bcrypt.hash(password, 12);

		query = `INSERT INTO users (email, password) VALUES ("${email}", "${hashed_password}")`;
		// console.log({query})
		const result = await sequelize_session.query(query, {
			type: sequelize.QueryTypes.INSERT,
			transaction,
		});
		console.log(result);

		const token = jwt.sign(
			{ email: result.email, id: result[0] },
			process.env.JWT_SECRET,
			{
				expiresIn: '1h',
			}
		);

		await transaction.commit();
		res.status(201).json({ result: { id: result[0] }, token });
	} catch (error) {
		transaction.rollback();
		res.status(500).json({ message: 'Something went wrong' });

		console.log(error);
	}
};
