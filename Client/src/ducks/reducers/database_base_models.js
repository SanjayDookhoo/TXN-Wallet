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
			type: 'float',
		},
		_foreign_key: {
			table: 'transaction',
			on_delete: 'cascade',
		},
	},
};
