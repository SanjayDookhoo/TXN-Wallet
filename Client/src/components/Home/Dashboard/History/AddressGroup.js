import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faPlus,
	faMinus,
	faSort,
	faSortUp,
	faSortDown,
} from '@fortawesome/free-solid-svg-icons';
import covalentAPI from '../../../../ducks/api/covalent';
import Transaction from './Transaction';
import { createLoadingModal, removeLoadingModal } from '../../LoadingModal';
import { useSnackbar } from 'notistack';
import { adjustDecimalPoint, valueLengthPreProcessing } from '../utils';
import { useSelector } from 'react-redux';

const compare = (asc_order, field, a, b) => {
	// only string
	if (field === 'category' || field === 'type') {
		const new_a = a[field] ? a[field] : '';
		const new_b = b[field] ? b[field] : '';

		return asc_order
			? new_a.localeCompare(new_b)
			: new_b.localeCompare(new_a);
	} else {
		// rest is numbers
		const new_a = a[field] ? a[field] : 0;
		const new_b = b[field] ? b[field] : 0;

		return asc_order ? new_a - new_b : new_b - new_a;
	}
};

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
	const app = useSelector((state) => state.app);
	const [collapsed, updateCollapsed] = useState(false);
	const [transactions, updateTransactions] = useState([]);
	const [transactions_details, updateTransactionsDetails] = useState([]);
	const [sort_criteria, updateSortCriteria] = useState('numerical_timestamp');
	const [asc_order, updateAscOrder] = useState(false);

	useEffect(() => {
		const temp_transactions_details = [];

		transactions.forEach((transaction) => {
			const log_events = transaction.log_events;

			const found = log_events.find(
				(log_event) =>
					log_event.decoded.name === 'Claimed' ||
					log_event.decoded.name === 'Deposit' ||
					log_event.decoded.name === 'Transfer'
			);

			if (found && database.transaction) {
				const { decoded, sender_contract_decimals } = found;
				let param_search;
				let value;
				let type;

				switch (decoded.name) {
					case 'Claimed':
						param_search = decoded.params.find(
							(param) => param.name === 'amount'
						);
						value = param_search?.value;
						type = 'Credit';
						break;
					case 'Deposit':
						param_search = decoded.params.find(
							(param) => param.name === 'amount'
						);
						value = param_search?.value;
						type = 'Debit';
						break;
					case 'Transfer':
						param_search = decoded.params.find(
							(param) => param.name === 'value'
						);
						value = param_search?.value;

						param_search = decoded.params.find(
							(param) => param.name === 'from'
						);
						if (param_search?.value === address.address_hash) {
							type = 'Debit';
						} else {
							type = 'Credit';
						}
						break;

					default:
						break;
				}

				const new_value = valueLengthPreProcessing(
					adjustDecimalPoint(value, sender_contract_decimals)
				);

				const numerical_value = parseFloat(
					adjustDecimalPoint(value, sender_contract_decimals)
				);

				const timestamp = new Date(
					transaction.block_signed_at
				).toLocaleString();

				const transaction_notes_found = Object.values(
					database.transaction
				).find(
					(database_transcation) =>
						database_transcation.transaction_hash ===
						transaction.tx_hash
				);

				temp_transactions_details.push({
					tx_hash: transaction.tx_hash,
					category: transaction_notes_found?.category,
					type,
					value: new_value,
					numerical_value,
					timestamp,
					numerical_timestamp: new Date(timestamp).getTime(),
				});
			}
		});

		updateTransactionsDetails(temp_transactions_details);
	}, [transactions, database]);

	const toggleSort = (toggle_criteria) => {
		if (sort_criteria === toggle_criteria) {
			updateAscOrder(!asc_order);
		} else {
			if (toggle_criteria === 'category' || toggle_criteria === 'type') {
				// only string value starts at ascending order
				updateAscOrder(true);
			} else {
				// any other value starts at descending order
				updateAscOrder(false);
			}
			updateSortCriteria(toggle_criteria);
		}
	};

	const sortIconRender = (toggle_criteria) => {
		if (sort_criteria !== toggle_criteria) {
			return <FontAwesomeIcon icon={faSort} />;
		} else {
			if (asc_order) {
				return <FontAwesomeIcon icon={faSortUp} />;
			} else {
				return <FontAwesomeIcon icon={faSortDown} />;
			}
		}
	};

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
		<div className="address-group my-4 p-2 rounded-lg border-2 border-yellow-400 bg-gray-400">
			<div
				className="address-group-header flex justify-between items-center h-12 group cursor-pointer"
				onClick={toggleCollapsible}
			>
				<div className=""></div>
				<div
					className={`address-name cursor-pointer rounded-lg p-2 ${
						app.is_mobile_app ? '' : 'group-hover:text-lg'
					}`}
				>
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
				<table className="w-full border border-yellow-200 mt-2 rounded-lg text-xs lg:text-base">
					<thead>
						<tr>
							<th
								className="border border-yellow-200 cursor-pointer"
								onClick={() => toggleSort('category')}
							>
								{sortIconRender('category')} Category
							</th>
							<th
								className="border border-yellow-200 cursor-pointer"
								onClick={() => toggleSort('type')}
							>
								{sortIconRender('type')} Credit/Debit
							</th>
							<th
								className="border border-yellow-200 cursor-pointer"
								onClick={() => toggleSort('numerical_value')}
							>
								{sortIconRender('numerical_value')} Amount
							</th>
							<th
								className="border border-yellow-200 cursor-pointer"
								onClick={() =>
									toggleSort('numerical_timestamp')
								}
							>
								{sortIconRender('numerical_timestamp')}{' '}
								Timestamp
							</th>
						</tr>
					</thead>
					<tbody>
						{transactions_details
							.sort((a, b) =>
								compare(asc_order, sort_criteria, a, b)
							)
							.map((transaction_details) => (
								<Transaction
									key={transaction_details.tx_hash}
									transaction_details={transaction_details}
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
