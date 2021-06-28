import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import covalentAPI from '../../../../ducks/api/covalent';
import { useDispatch, useSelector } from 'react-redux';
import { updateApp } from '../../../../ducks/actions/app';
import { useHistory } from 'react-router';

const Transaction = ({
	transaction_details,
	updateTransactionSelected,
	...other_params
}) => {
	const dispatch = useDispatch();
	const history = useHistory();

	const handleOnclick = () => {
		updateTransactionSelected(transaction_details.tx_hash);

		history.push('/transaction_notes');
	};

	return (
		<>
			<tr
				className="transaction cursor-pointer p-2 h-12 hover:bg-yellow-200"
				onClick={handleOnclick}
			>
				<td className="border px-1 border-yellow-200">
					{transaction_details.category}
				</td>
				<td className="border px-1 border-yellow-200">
					{transaction_details.type}
				</td>
				<td className="border px-1 border-yellow-200">
					{transaction_details.value}
				</td>
				<td className="border px-1 border-yellow-200">
					{transaction_details.timestamp}
				</td>
			</tr>
		</>
	);
};

export default Transaction;
