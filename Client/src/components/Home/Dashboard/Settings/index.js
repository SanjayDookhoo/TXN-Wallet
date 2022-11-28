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
import Button from '../../../Button';

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
	const [passDownAddress, updatePassDownAddress] = useState(null);

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
		updateBlockchainAddValue('');

		const modal = createLoadingModal();
		dispatch(
			databasePost({
				table_name: 'chain',
				req_body: {
					inserts: [
						{
							covalent_chain_id: value,
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

	const useExample = () => {
		updateBlockchainAddValue('');

		const modal = createLoadingModal();
		dispatch(
			databasePost({
				table_name: 'chain',
				req_body: {
					inserts: [
						{
							covalent_chain_id: '250',
						},
					],
				},
				onFailure: (error) => {
					console.log({ error });
					enqueueSnackbar('Something went wrong', {
						variant: 'error',
					});
				},
				onSuccess: (data) => {
					updatePassDownAddress({
						chainId: data.result[0].id,
						address_hash: '0xe2cDA3991247F7d4b546C6884C26B092AAd38dc2',
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
		passDownAddress,
	};

	return (
		<>
			<div className="flex">
				<ContentHeading>Settings</ContentHeading>
				{database.chain && Object.values(database.chain).length == 0 && (
					<div className="pl-4">
						<Button variant="info" onClick={useExample}>
							Use Example
						</Button>
					</div>
				)}
			</div>
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
					<InputLabel id="blockchain_add">Select Blockchain to Add</InputLabel>
					<Select
						labelId="blockchain_add"
						id="blockchain_add_id"
						value={blockchain_add_value}
						onChange={handleBlockchainOnChange}
					>
						{avail_chains.map((chain) => (
							<MenuItem key={chain.chain_id} value={chain.chain_id}>
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
