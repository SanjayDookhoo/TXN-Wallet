import express from 'express';
import exphbs from 'express-handlebars';
import path from 'path';
import cors from 'cors';
import sequelize from 'sequelize';
import dotenv from 'dotenv';
import other_models from './models/other.js';
import user_model from './models/user.js';

import user_router from './routes/user.js';
import general_router from './routes/general.js';

import auth from './middleware/auth.js';

dotenv.config();

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

const schema = {
	...other_models(sequelize_session),
	...user_model(sequelize_session),
};

// Test DB
sequelize_session
	.sync({
		logging: false,
		force: false,
	})
	.then(() => console.log('Database Connected'))
	.catch((err) => console.log('Error: ' + err));

const app = express();
app.use(express.json());
app.use(cors());

app.use('/user', user_router);
app.use('*', auth, general_router);

const PORT = process.env.SERVER_PORT || 5000;
app.listen(PORT, () =>
	console.log(`Server Running on Port: http://localhost:${PORT}`)
);
