export const base_models = {
	chain: {
		covalent_chain_id: {
			type: 'integer',
		},
	},
	address: {
		address_hash: {
			type: 'string',
		},
		_foreign_key: {
			table: 'chain',
			on_delete: 'cascade',
		},
	},
};
