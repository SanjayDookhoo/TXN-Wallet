import express from 'express';
import exphbs from 'express-handlebars';
import path from 'path';
import cors from 'cors';
import sequelize from 'sequelize';
import dotenv from 'dotenv';
import models from './models.js';
import general_router from './routes/general_router.js';

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

const schema = models(sequelize_session);
console.log(schema.Customer);

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
app.use('*', general_router);

const PORT = process.env.SERVER_PORT || 5002;
app.listen(PORT, () =>
	console.log(`Server Running on Port: http://localhost:${PORT}`)
);
