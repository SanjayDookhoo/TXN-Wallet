import sequelize from 'sequelize';
const { STRING, INTEGER, FLOAT, DATE } = sequelize.DataTypes;

const user = (sequelize_session) => {
	return {
		User: sequelize_session.define(
			'user',
			{
				email: {
					type: STRING,
				},
				password: {
					type: STRING,
				},
			},
			{ underscored: true }
		),
	};
};

export default user;
