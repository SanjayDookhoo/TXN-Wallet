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
};
