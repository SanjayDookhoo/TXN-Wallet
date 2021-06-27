import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import covalentAPI from '../../../../ducks/api/covalent';
import { adjustDecimalPoint, valueLengthPreProcessing } from '../utils';
import { useDispatch } from 'react-redux';
import { updateApp } from '../../../../ducks/actions/app';
import { useHistory } from 'react-router';

const Transaction = ({
	transaction,
	address,
	updateTransactionSelected,
	...other_params
}) => {
	const dispatch = useDispatch();
	const history = useHistory();
	const [transaction_details, updateTransactionDetails] = useState({});
	const [found, updateFound] = useState(false);

	useEffect(() => {
		const log_events = transaction.log_events;
		// console.log(log_events);

		const found = log_events.find(
			(log_event) =>
				log_event.decoded.name === 'Claimed' ||
				log_event.decoded.name === 'Deposit' ||
				log_event.decoded.name === 'Transfer'
		);

		if (found) {
			console.log({ transaction });
		}

		// console.log({ found });
		updateFound(found ? true : false);

		if (found) {
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
					type = 'in';
					break;
				case 'Deposit':
					param_search = decoded.params.find(
						(param) => param.name === 'amount'
					);
					value = param_search?.value;
					type = 'out';
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
						type = 'out';
					} else {
						type = 'in';
					}
					break;

				default:
					break;
			}

			const new_value = valueLengthPreProcessing(
				adjustDecimalPoint(value, sender_contract_decimals)
			);

			const timestamp = new Date(
				transaction.block_signed_at
			).toLocaleString();

			updateTransactionDetails({
				type,
				value: new_value,
				timestamp,
			});
		}
	}, [transaction]);

	const handleOnclick = () => {
		updateTransactionSelected(transaction.tx_hash);

		let pathname = window.location.pathname;
		pathname =
			pathname.slice(-1) === '/'
				? pathname.slice(0, pathname.length - 1)
				: pathname;
		history.push(pathname + '/transaction_notes');
	};

	return (
		<>
			{found ? (
				<div
					className="transaction flex justify-center items-center waves-effect cursor-pointer p-2"
					onClick={handleOnclick}
				>
					<div className="w-1/4"></div>
					<div className="w-1/4">{transaction_details.type}</div>
					<div className="w-1/4">{transaction_details.value}</div>
					<div className="w-1/4">{transaction_details.timestamp}</div>
				</div>
			) : null}
		</>
	);
};

export default Transaction;
