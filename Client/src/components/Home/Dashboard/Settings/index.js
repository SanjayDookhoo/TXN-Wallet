import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ContentHeading from '../ContentHeading';
import ContentBody from '../ContentBody';
import {
	databaseGet,
	databasePost,
	databaseDelete,
	databasePatch,
} from '../../../../ducks/actions/database';
import { InputLabel, Select, MenuItem, FormControl } from '@material-ui/core';
import BlockchainAddressGroup from './BlockchainAddressGroup';
import { createLoadingModal, removeLoadingModal } from '../../LoadingModal';
import { useSnackbar } from 'notistack';

const Settings = ({ chains }) => {
	const dispatch = useDispatch();
	const { enqueueSnackbar } = useSnackbar();

	const database = useSelector((state) => state.database);
	const [user, updateUser] = useState(
		JSON.parse(localStorage.getItem('profile'))
	);
	const [chains_map, updateChainsMap] = useState({});
	const [avail_chains, updateAvailChains] = useState([]);
	const [blockchain_add_value, updateBlockchainAddValue] = useState('');

	useEffect(() => {
		if (database.chain) {
			const database_chain_ids = Object.values(database.chain).map(
				(chain) => chain.covalent_chain_id
			);
			const temp_avail_chains = chains.filter(
				(chain) => !database_chain_ids.includes(chain.chain_id)
			);
			updateAvailChains(temp_avail_chains);

			const temp_chains_map = Object.fromEntries(
				chains.map((chain) => [chain.chain_id, chain])
			);
			updateChainsMap(temp_chains_map);
		}
	}, [chains, database]);

	useEffect(() => {
		const modal = createLoadingModal();
		dispatch(
			databaseGet({
				table_name: 'chain',
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

	const handleBlockchainOnChange = (e) => {
		updateBlockchainAddValue('-1');

		const modal = createLoadingModal();
		dispatch(
			databasePost({
				table_name: 'chain',
				req_body: {
					inserts: [
						{
							covalent_chain_id: e.target.value,
						},
					],
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
	};

	const blockchain_address_group_params = {
		database,
		chains,
		chains_map,
	};

	return (
		<>
			<ContentHeading>Settings</ContentHeading>
			<ContentBody>
				<div className="">
					{database.chain &&
						Object.values(database.chain).map((chain) => (
							<BlockchainAddressGroup
								key={chain.id}
								chain={chain}
								{...blockchain_address_group_params}
							/>
						))}
				</div>

				<FormControl className="w-full">
					<InputLabel id="blockchain_add">
						Select Blockchain to Add
					</InputLabel>
					<Select
						labelId="blockchain_add"
						id="blockchain_add_id"
						value={blockchain_add_value}
						onChange={handleBlockchainOnChange}
					>
						{avail_chains.map((chain) => (
							<MenuItem
								key={chain.chain_id}
								value={chain.chain_id}
							>
								{chain.label}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</ContentBody>
		</>
	);
};

export default Settings;
