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
