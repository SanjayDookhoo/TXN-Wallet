import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import covalentAPI from '../../../../ducks/api/covalent';

const AddressGroup = ({
	database,
	chain,
	address,
	tokens_map,
	from_date,
	to_date,
	...other_params
}) => {
	const [collapsed, updateCollapsed] = useState(false);
	const [txn_history, updateTxnHistory] = useState([]);

	// get covalent data
	useEffect(async () => {
		if (address && from_date && to_date) {
			const { data, status } = await covalentAPI.get(
				`/${chain.covalent_chain_id}/address/${address.address_hash}/transactions_v2/`,
				{
					params: {
						match: `{"block_signed_at": {"$gte": '${from_date}T00:00:00Z', "$lte": '${to_date}T23:59:59Z'}}`,
					},
				}
			);

			console.log(data.data.items);

			updateTxnHistory(
				data.data.items.filter((txn) => txn.successful === true)
			);
		}
	}, [chain, address, from_date, to_date]);

	const toggleCollapsible = () => {
		updateCollapsed(!collapsed);
	};

	return (
		<div className="address-group my-4 p-2 bg-green-500">
			<div
				className="address-group-header flex justify-between items-center h-12 group cursor-pointer"
				onClick={toggleCollapsible}
			>
				<div className=""></div>
				<div className="address-name cursor-pointer rounded-lg p-2 group-hover:text-lg">
					{collapsed ? (
						<FontAwesomeIcon icon={faPlus} />
					) : (
						<FontAwesomeIcon icon={faMinus} />
					)}
					<div className="inline pl-2">{address?.name}</div>
				</div>
				<div></div>
			</div>
			<div className={`p-2 ${collapsed && 'hidden'}`}>test</div>
		</div>
	);
};

export default AddressGroup;
