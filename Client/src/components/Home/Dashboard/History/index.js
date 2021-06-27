import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faSignOutAlt,
	faCog,
	faChartLine,
	faHistory,
	faMoneyBill,
	faCalculator,
} from '@fortawesome/free-solid-svg-icons';
import ContentHeading from '../ContentHeading';
import ContentBody from '../ContentBody';
import BlockchainAddressGroup from './BlockchainAddressGroup';

const History = ({ chains }) => {
	const dispatch = useDispatch();

	const database = useSelector((state) => state.database);
	const [user, updateUser] = useState(
		JSON.parse(localStorage.getItem('profile'))
	);
	const [chains_map, updateChainsMap] = useState({});
	const [from_date, updateFromDate] = useState('');
	const [to_date, updateToDate] = useState('');

	useEffect(() => {
		let date = new Date();
		updateToDate(date.toISOString().split('T')[0]);

		date = date.setMonth(date.getMonth() - 2);
		updateFromDate(new Date(date).toISOString().split('T')[0]);
	}, []);

	useEffect(() => {
		if (database.chain) {
			const temp_chains_map = Object.fromEntries(
				chains.map((chain) => [chain.chain_id, chain])
			);
			updateChainsMap(temp_chains_map);
		}
	}, [chains, database]);

	const blockchain_address_group_params = {
		database,
		chains,
		chains_map,
		from_date,
		to_date,
	};

	useEffect(() => {
		console.log({ from_date, to_date });
	}, [from_date, to_date]);

	return (
		<>
			<ContentHeading>History</ContentHeading>
			<ContentBody>
				<div className="date-range">
					<input
						type="date"
						value={from_date}
						onChange={(e) => updateFromDate(e.target.value)}
					/>
					<input
						type="date"
						value={to_date}
						onChange={(e) => updateToDate(e.target.value)}
					/>
				</div>
				<div className="">
					{database.chain &&
						Object.values(database.chain)
							.sort((a, b) =>
								chains_map[a.covalent_chain_id]?.label
									.toString()
									.localeCompare(
										chains_map[
											b.covalent_chain_id
										]?.label.toString()
									)
							)
							.map((chain) => (
								<BlockchainAddressGroup
									key={chain.id}
									chain={chain}
									{...blockchain_address_group_params}
								/>
							))}
				</div>
			</ContentBody>
		</>
	);
};

export default History;
