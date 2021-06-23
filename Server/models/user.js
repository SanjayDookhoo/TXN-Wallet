import sequelize from 'sequelize';
const { STRING, INTEGER, FLOAT, DATE } = sequelize.DataTypes;

const user = (sequelize_session) => {
	return {
		User: sequelize_session.define(
			'user',
			{
				user_name: {
					type: STRING,
				},
				email: {
					type: STRING,
				},
				password: {
					type: STRING,
				},
			},
			{ underscored: true, freezeTableName: true }
		),
	};
};

export default user;
