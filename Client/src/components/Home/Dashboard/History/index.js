import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faSortUp,
	faSortDown,
	faSort,
	faRecycle,
	faClipboardList,
	faHome,
} from '@fortawesome/free-solid-svg-icons';
import ContentHeading from '../ContentHeading';
import ContentBody from '../ContentBody';
import BlockchainAddressGroup from './BlockchainAddressGroup';
import { Breadcrumbs, Fab } from '@material-ui/core';
import { useHistory } from 'react-router';
import TransactionNotes from './TransactionNotes';
import {
	databaseGet,
	databasePost,
	databaseDelete,
	databasePatch,
} from '../../../../ducks/actions/database';
import { createLoadingModal, removeLoadingModal } from '../../LoadingModal';
import { useSnackbar } from 'notistack';
import { useLocation } from 'react-router-dom';

const History = ({ chains }) => {
	const dispatch = useDispatch();
	const history = useHistory();
	const location = useLocation();
	const { enqueueSnackbar } = useSnackbar();

	const database = useSelector((state) => state.database);
	const [user, updateUser] = useState(
		JSON.parse(localStorage.getItem('profile'))
	);
	const [chains_map, updateChainsMap] = useState({});
	const [from_date, updateFromDate] = useState('');
	const [to_date, updateToDate] = useState('');
	const [breadcrumb_view, updateBreadcrumbView] = useState('home');
	const [transaction_selected, updateTransactionSelected] = useState(null);

	useEffect(() => {
		const modal = createLoadingModal();
		dispatch(
			databaseGet({
				table_name: 'transaction',
				req_params: {
					created_by_user: user?.result?.id,
				},
				onFailure: (error) => {
					console.log({ error });
					enqueueSnackbar('Something went wrong', {
						variant: 'error',
					});
				},
				onFinish: () => {
					removeLoadingModal(modal);
				},
			})
		);
	}, [user]);

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
		updateTransactionSelected,
	};

	const transaction_notes_params = {};

	const changeBreadcrumbView = (new_breadcrumb_view) => {
		let pathname = location.pathname;

		if (pathname === '/' && new_breadcrumb_view === 'transaction_notes') {
			history.push('/transaction_notes');
		}

		if (
			pathname === '/transaction_notes' &&
			new_breadcrumb_view === 'home'
		) {
			history.goBack();
		}
	};

	useEffect(() => {
		let pathname = location.pathname;

		if (pathname === '/') {
			updateBreadcrumbView('home');
		}

		if (pathname === '/transaction_notes') {
			updateBreadcrumbView('transaction_notes');
		}
	}, [location.pathname]);

	return (
		<>
			<ContentHeading>History</ContentHeading>
			<ContentBody>
				<Breadcrumbs aria-label="breadcrumb">
					<div
						className="waves-effect cursor-pointer"
						onClick={() => changeBreadcrumbView('home')}
					>
						<FontAwesomeIcon icon={faHome} /> home
					</div>
					{breadcrumb_view === 'transaction_notes' && (
						<div
							className="waves-effect cursor-pointer"
							onClick={() =>
								changeBreadcrumbView('transaction_notes')
							}
						>
							<FontAwesomeIcon icon={faClipboardList} />{' '}
							Transaction Notes
						</div>
					)}
				</Breadcrumbs>
				<div
					className={`${breadcrumb_view !== 'home' ? 'hidden' : ''}`}
				>
					<div className="date-range flex justify-around items-center">
						<div className="p-2">
							From:{' '}
							<input
								className="p-3 rounded-md"
								type="date"
								value={from_date}
								onChange={(e) => updateFromDate(e.target.value)}
							/>
						</div>
						<div className="p-2">
							To:{' '}
							<input
								className="p-3 rounded-md"
								type="date"
								value={to_date}
								onChange={(e) => updateToDate(e.target.value)}
							/>
						</div>
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
				</div>
				<div
					className={`${
						breadcrumb_view !== 'transaction_notes' ? 'hidden' : ''
					}`}
				>
					<TransactionNotes
						transaction_selected={transaction_selected}
						{...transaction_notes_params}
					/>
				</div>
			</ContentBody>
		</>
	);
};

export default History;
