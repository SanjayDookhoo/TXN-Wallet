import sequelize from 'sequelize';
const { STRING, INTEGER, FLOAT, DATE } = sequelize.DataTypes;

export const base_models = {
	// Example parent table
	customer: {
		name: {
			type: STRING,
		},
		address: {
			type: STRING,
		},
		age: {
			type: INTEGER,
		},
	},
	// Example related table
	invoice: {
		amount: {
			type: INTEGER,
		},
		_foreign_key: {
			table: 'customer',
			on_delete: 'cascade',
		},
	},
};

const models = (sequelize_session) => {
	const schema = {};

	Object.entries(base_models).forEach(([table_name, table_meta]) => {
		const { _foreign_key, ...table_fields } = table_meta;

		schema[capitalize(table_name)] = sequelize_session.define(
			table_name,
			{
				...table_fields,
			},
			{ underscored: true }
		);
		if (_foreign_key) {
			oneToMany({
				schema,
				A: _foreign_key.table,
				B: table_name,
				on_delete: _foreign_key.on_delete,
			});
		}
	});

	return schema;
};

export default models;

//  'table_name' => 'Table_name'
const capitalize = (str) => {
	return str.charAt(0).toUpperCase() + str.slice(1);
};

const oneToMany = ({ schema, A, B, on_delete }) => {
	// The A.hasMany(B) association means that a One-To-Many relationship exists between A and B, with the foreign key being defined in the target model (B).
	schema[capitalize(A)].hasMany(schema[capitalize(B)], {
		onDelete: on_delete,
	});
};
