import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import covalentAPI from '../../../../ducks/api/covalent';
import Transaction from './Transaction';
import { createLoadingModal, removeLoadingModal } from '../../LoadingModal';
import { useSnackbar } from 'notistack';

const AddressGroup = ({
	database,
	chain,
	address,
	tokens_map,
	from_date,
	to_date,
	...other_params
}) => {
	const { enqueueSnackbar } = useSnackbar();
	const [collapsed, updateCollapsed] = useState(false);
	const [transactions, updateTransactions] = useState([]);

	// get covalent data
	useEffect(async () => {
		if (address && from_date && to_date) {
			const modal = createLoadingModal();
			try {
				const { data, status } = await covalentAPI.get(
					`/${chain.covalent_chain_id}/address/${address.address_hash}/transactions_v2/`,
					{
						params: {
							match: `{"block_signed_at": {"$gte": '${from_date}T00:00:00Z', "$lte": '${to_date}T23:59:59Z'}}`,
						},
					}
				);

				updateTransactions(
					data.data.items.filter((txn) => txn.successful === true)
				);
			} catch (error) {
				console.log({ error });
				enqueueSnackbar('Something went wrong', {
					variant: 'error',
				});
			} finally {
				removeLoadingModal(modal);
			}
		}
	}, [chain, address, from_date, to_date]);

	const toggleCollapsible = () => {
		updateCollapsed(!collapsed);
	};

	const transaction_params = {
		address,
		...other_params,
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
			<div className={`p-2 ${collapsed && 'hidden'}`}>
				<table className="w-full border border-green-800 mt-2 text-xs md:text-base">
					<thead>
						<tr>
							<th className="border border-green-800">
								Category
							</th>
							<th className="border border-green-800">
								Credit/Debit
							</th>
							<th className="border border-green-800">Amount</th>
							<th className="border border-green-800">
								Timestamp
							</th>
						</tr>
					</thead>
					<tbody>
						{transactions.map((transaction) => (
							<Transaction
								key={transaction.tx_hash}
								transaction={transaction}
								{...transaction_params}
							/>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default AddressGroup;
