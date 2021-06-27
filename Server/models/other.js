import sequelize from 'sequelize';
const { STRING, INTEGER, FLOAT, DATE, BLOB } = sequelize.DataTypes;

export const base_models = {
	chain: {
		covalent_chain_id: {
			type: 'string',
		},
	},
	address: {
		name: {
			type: 'string',
		},
		address_hash: {
			type: 'string',
		},
		_foreign_key: {
			table: 'chain',
			on_delete: 'cascade',
		},
	},
	transaction: {
		category: {
			type: 'string',
		},
		notes: {
			type: 'string',
		},
		transaction_hash: {
			type: 'string',
		},
	},
	item: {
		name: {
			type: 'string',
		},
		price: {
			type: 'string',
		},
		_foreign_key: {
			table: 'transaction',
			on_delete: 'cascade',
		},
	},
	image: {
		name: {
			type: 'string',
		},
		image_type: {
			type: 'string',
		},
		blob: {
			type: 'blob',
		},
		_foreign_key: {
			table: 'transaction',
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
				case 'blob':
					temp_table_fields[table_field].type = BLOB('medium');
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
			{ underscored: true, freezeTableName: true }
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
