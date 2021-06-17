import sequelize from 'sequelize';
const { STRING, INTEGER, FLOAT, DATE } = sequelize.DataTypes;

export const base_models = {
	// Example parent table
	customer: {
		name: {
			type: 'string',
		},
		address: {
			type: 'string',
		},
		age: {
			type: 'integer',
		},
	},
	// Example related table
	invoice: {
		amount: {
			type: 'integer',
		},
		_foreign_key: {
			table: 'customer',
			on_delete: 'cascade',
		},
	},
};

const other = (sequelize_session) => {
	const schema = {};

	Object.entries(base_models).forEach(([table_name, table_meta]) => {
		const { _foreign_key, ...table_fields } = table_meta;

		// type replace
		const temp_table_fields = {
			...table_fields,
			created_by_user: { type: 'integer' }, // use for authenticating CRUD operations for the user
		};
		Object.keys(temp_table_fields).forEach((table_field) => {
			switch (temp_table_fields[table_field].type) {
				case 'string':
					temp_table_fields[table_field].type = STRING;
					break;
				case 'integer':
					temp_table_fields[table_field].type = INTEGER;
					break;
				case 'float':
					temp_table_fields[table_field].type = FLOAT;
					break;
				case 'date':
					temp_table_fields[table_field].type = DATE;
					break;
				default:
					break;
			}
		});

		schema[capitalize(table_name)] = sequelize_session.define(
			table_name,
			{
				...temp_table_fields,
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

export default other;

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
