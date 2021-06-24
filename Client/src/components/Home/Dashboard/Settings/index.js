import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faTrash,
	faEdit,
	faPlus,
	faMinus,
} from '@fortawesome/free-solid-svg-icons';
import ContentHeading from '../ContentHeading';
import ContentBody from '../ContentBody';
import {
	databaseGet,
	databasePost,
	databaseDelete,
	databasePatch,
} from '../../../../ducks/actions/database';
import { InputLabel, Select, MenuItem } from '@material-ui/core';
import Input from '../../../Input';
import Button from '../../../Button';

const initialState = {
	name: '',
	address_hash: '',
};

const Settings = ({ chains }) => {
	const dispatch = useDispatch();
	const database = useSelector((state) => state.database);
	const [user, updateUser] = useState(
		JSON.parse(localStorage.getItem('profile'))
	);
	const [chains_map, updateChainsMap] = useState({});
	const [avail_chains, updateAvailChains] = useState([]);
	const [blockchain_add_value, updateBlockchainAddValue] = useState('-1');

	useEffect(() => {
		console.log({ chains });
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
		console.log({ database });
	}, [database]);

	useEffect(() => {
		console.log({ user });
	}, [user]);

	useEffect(() => {
		dispatch(
			databaseGet({
				table_name: 'chain',
				req_params: {
					created_by_user: user?.result?.id,
				},
			})
		);
	}, [user]);

	const handleBlockchainOnChange = (e) => {
		updateBlockchainAddValue('-1');

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

				<div className="">
					<InputLabel id="blockchain_add">
						Select Blockchain to Add
					</InputLabel>
					<Select
						labelId="blockchain_add"
						label="Please select"
						id="blockchain_add_id"
						value={blockchain_add_value}
						onChange={handleBlockchainOnChange}
						className="w-full"
					>
						<MenuItem value="-1" disabled>
							Please select
						</MenuItem>
						{avail_chains.map((chain) => (
							<MenuItem
								key={chain.chain_id}
								value={chain.chain_id}
							>
								{chain.label}
							</MenuItem>
						))}
					</Select>
				</div>
			</ContentBody>
		</>
	);
};

export default Settings;

const BlockchainAddressGroup = ({ database, chains, chains_map, chain }) => {
	const dispatch = useDispatch();
	const [form_data, updateFormData] = useState(initialState);
	const [form_mode_add, updateFormModeAdd] = useState(true);
	const [editing_id, updateEditingId] = useState(null);
	const [collapsed, updateCollapsed] = useState(true);

	const handleBlockchainRemove = (e) => {
		e.stopPropagation();
		dispatch(
			databaseDelete({
				table_name: 'chain',
				req_body: {
					ids: [chain.id],
				},
			})
		);
	};

	const handleChange = (e) =>
		updateFormData({ ...form_data, [e.target.name]: e.target.value });

	const handleSubmit = (e) => {
		e.preventDefault();

		if (form_mode_add) {
			dispatch(
				databasePost({
					table_name: 'address',
					req_body: {
						inserts: [
							{
								...form_data,
								chain_id: chain.id,
							},
						],
					},
					onSuccess: () => {
						console.log('test');
						updateFormData(initialState);
					},
				})
			);
		} else {
			const updates = {
				[editing_id]: {},
			};

			if (form_data.name !== database.address[editing_id].name) {
				updates[editing_id] = {
					...updates[editing_id],
					name: form_data.name,
				};
			}
			if (
				form_data.address_hash !==
				database.address[editing_id].address_hash
			) {
				updates[editing_id] = {
					...updates[editing_id],
					address_hash: form_data.address_hash,
				};
			}

			if (Object.values(updates[editing_id]).length !== 0) {
				dispatch(
					databasePatch({
						table_name: 'address',
						req_body: {
							updates,
						},
					})
				);
			}
		}
	};

	const resetForm = (e) => {
		e.preventDefault();
		updateFormData(initialState);
	};

	const handleAddressRemove = (id) => {
		updateFormData(initialState);
		updateFormModeAdd(true);
		updateEditingId(null);

		dispatch(
			databaseDelete({
				table_name: 'address',
				req_body: {
					ids: [id],
				},
			})
		);
	};

	const handleAddressUpdate = (id) => {
		const { name, address_hash } = database.address[id];

		updateFormData({
			name,
			address_hash,
		});
		updateFormModeAdd(false);
		updateEditingId(id);
	};

	const cancelEdit = (e) => {
		e.preventDefault();
		updateFormData(initialState);
		updateFormModeAdd(true);
		updateEditingId(null);
	};

	const toggleCollapsible = () => {
		updateCollapsed(!collapsed);
	};

	const address_params = {
		handleAddressUpdate,
		handleAddressRemove,
		editing_id,
	};

	return (
		<div
			className="blockchain-address-group my-4 p-2 bg-green-300 cursor-pointer"
			onClick={toggleCollapsible}
		>
			<div className="blockchain-address-group-header flex justify-between items-center h-12 group">
				<div className="blockchain-icon">
					<img
						className="h-10"
						src={chains_map[chain.covalent_chain_id]?.logo_url}
					/>
				</div>
				<div className="blockchain-name cursor-pointer waves-effect rounded-lg p-2 group-hover:text-lg">
					{collapsed ? (
						<FontAwesomeIcon icon={faPlus} />
					) : (
						<FontAwesomeIcon icon={faMinus} />
					)}
					<div className="inline pl-2">
						{chains_map[chain.covalent_chain_id]?.label}
					</div>
				</div>
				<div
					className="delete-address cursor-pointer waves-effect rounded-lg p-2 hover:text-red-400"
					onClick={handleBlockchainRemove}
				>
					<FontAwesomeIcon icon={faTrash} />
				</div>
			</div>
			<div className={`addresses ${collapsed && 'hidden'}`}>
				{database.address &&
					Object.values(database.address).length !== 0 && (
						<table className="w-full border border-green-800 mt-2">
							<thead>
								<tr>
									<th className="border border-green-800">
										Name
									</th>
									<th className="border border-green-800">
										Address
									</th>
									<th className="border border-green-800">
										Options
									</th>
								</tr>
							</thead>
							<tbody>
								{database.address &&
									Object.values(database.address)
										.filter(
											(address) =>
												address.chain_id === chain.id
										)
										.map((address) => (
											<Address
												key={address.id}
												address={address}
												{...address_params}
											/>
										))}
							</tbody>
						</table>
					)}
			</div>
			<div className={`add-address ${collapsed && 'hidden'}`}>
				<form onSubmit={handleSubmit}>
					<Input
						name="name"
						label="Name"
						value={form_data.name}
						handleChange={handleChange}
						type="text"
					/>
					<Input
						name="address_hash"
						label="Address"
						value={form_data.address_hash}
						handleChange={handleChange}
						type="text"
					/>
					<div className="address-buttons flex justify-around items-center">
						<Button variant="secondary" type="submit">
							{form_mode_add ? 'Add' : 'Edit'} Address
						</Button>
						<Button variant="light" onClick={resetForm}>
							Reset
						</Button>
						{!form_mode_add && (
							<Button variant="light" onClick={cancelEdit}>
								Cancel
							</Button>
						)}
					</div>
				</form>
			</div>
		</div>
	);
};

const Address = ({
	address,
	handleAddressUpdate,
	handleAddressRemove,
	editing_id,
}) => {
	return (
		<tr
			className={`address ${editing_id === address.id && 'bg-green-700'}`}
		>
			<td className="px-1 border border-green-800">{address.name}</td>
			<td className="px-1 break-all border border-green-800">
				{address.address_hash}
			</td>
			<td className="px-1 border border-green-800">
				<div className="flex justify-between items-center">
					<div
						className="address-update cursor-pointer waves-effect rounded-lg p-2 hover:text-yellow-400"
						onClick={() => handleAddressUpdate(address.id)}
					>
						<FontAwesomeIcon icon={faEdit} />
					</div>
					<div
						className="address-delete cursor-pointer waves-effect rounded-lg p-2 hover:text-red-400"
						onClick={() => handleAddressRemove(address.id)}
					>
						<FontAwesomeIcon icon={faTrash} />
					</div>
				</div>
			</td>
		</tr>
	);
};
