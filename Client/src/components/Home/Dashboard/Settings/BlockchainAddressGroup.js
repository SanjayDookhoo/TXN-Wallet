import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faTrash,
	faEdit,
	faPlus,
	faMinus,
	faSort,
	faSortUp,
	faSortDown,
} from '@fortawesome/free-solid-svg-icons';
import { useSnackbar } from 'notistack';
import {
	databaseGet,
	databasePost,
	databaseDelete,
	databasePatch,
} from '../../../../ducks/actions/database';
import Input from '../../../Input';
import Button from '../../../Button';
import { createDeleteModal } from '../../DeleteModal';
import covalentAPI from '../../../../ducks/api/covalent';
import Address from './Address';
import coin_fallback from '../../../../assets/coin_fallback.png';
import { createLoadingModal, removeLoadingModal } from '../../LoadingModal';

const initialState = {
	name: '',
	address_hash: '',
};

const compare = (asc_order, field, a, b) => {
	// only string
	if (field === 'name' || field === 'address_hash') {
		const new_a = a[field] ? a[field] : '';
		const new_b = b[field] ? b[field] : '';

		return asc_order ? new_a.localeCompare(new_b) : new_b.localeCompare(new_a);
	} else {
		// rest is numbers
		const new_a = a[field] ? a[field] : 0;
		const new_b = b[field] ? b[field] : 0;

		return asc_order ? new_a - new_b : new_b - new_a;
	}
};

const BlockchainAddressGroup = ({
	database,
	chains,
	chains_map,
	chain,
	passDownAddress,
}) => {
	const dispatch = useDispatch();
	const { enqueueSnackbar } = useSnackbar();

	const [form_data, updateFormData] = useState(initialState);
	const [form_mode_add, updateFormModeAdd] = useState(true);
	const [editing_id, updateEditingId] = useState(null);
	const [collapsed, updateCollapsed] = useState(false);
	const [sort_criteria, updateSortCriteria] = useState('name');
	const [asc_order, updateAscOrder] = useState(false);
	const app = useSelector((state) => state.app);

	useEffect(() => {
		if (passDownAddress?.chainId == chain.id) {
			updateFormData({
				name: '',
				address_hash: passDownAddress.address_hash,
			});
		}
	}, [passDownAddress, chain]);

	const handleBlockchainRemove = (e) => {
		e.stopPropagation();
		const callback = () => {
			const modal = createLoadingModal();
			dispatch(
				databaseDelete({
					table_name: 'chain',
					req_body: {
						ids: [chain.id],
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

		createDeleteModal({ callback });
	};

	const handleChange = (e) =>
		updateFormData({ ...form_data, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();

		const modal = createLoadingModal();
		try {
			// check if address_hash is valid
			const { data, status } = await covalentAPI.get(
				`/${chain.covalent_chain_id}/address/${form_data.address_hash}/transactions_v2/`,
				{
					params: {
						limit: 1,
					},
				}
			);

			// if no error was thrown then the address provided is valid

			let flag = false;
			// check if this name is already existing for the user
			const found_name = Object.values(database.address)
				.filter((address) => address.id !== editing_id)
				.find((address) => address.name === form_data.name);
			if (found_name) {
				enqueueSnackbar('Name already added', {
					variant: 'error',
				});
				flag = true;
			}
			// check if this address_hash is already existing for the user
			const found_address_hash = Object.values(database.address)
				.filter((address) => address.id !== editing_id)
				.find((address) => address.address_hash === form_data.address_hash);
			if (found_address_hash) {
				enqueueSnackbar('Address already added', {
					variant: 'error',
				});
				flag = true;
			}

			if (!flag) {
				if (form_mode_add) {
					const modal = createLoadingModal();
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
								updateFormData(initialState);
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
						form_data.address_hash !== database.address[editing_id].address_hash
					) {
						updates[editing_id] = {
							...updates[editing_id],
							address_hash: form_data.address_hash,
						};
					}

					if (Object.values(updates[editing_id]).length !== 0) {
						const modal = createLoadingModal();
						dispatch(
							databasePatch({
								table_name: 'address',
								req_body: {
									updates,
								},
								onSuccess: () => {
									updateFormData(initialState);
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
					} else {
						enqueueSnackbar('Data did not change, please cancel instead', {
							variant: 'error',
						});
					}
				}
			}
		} catch (error) {
			console.log({ error });
			enqueueSnackbar('Malformed Address', {
				variant: 'error',
			});
		} finally {
			removeLoadingModal(modal);
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

		const callback = () => {
			const modal = createLoadingModal();
			dispatch(
				databaseDelete({
					table_name: 'address',
					req_body: {
						ids: [id],
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

		createDeleteModal({ callback });
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

	const toggleSort = (toggle_criteria) => {
		if (sort_criteria === toggle_criteria) {
			updateAscOrder(!asc_order);
		} else {
			if (toggle_criteria === 'name' || toggle_criteria === 'address_hash') {
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

	return (
		<div className="blockchain-address-group my-4 p-2 rounded-lg border-2 border-yellow-400 bg-gray-300">
			<div
				className="blockchain-address-group-header flex justify-between items-center h-12 group cursor-pointer"
				onClick={toggleCollapsible}
			>
				<div className="blockchain-icon">
					<img
						className="h-10"
						src={chains_map[chain.covalent_chain_id]?.logo_url}
						onError={(e) => {
							e.target.onerror = null;
							e.target.src = coin_fallback;
						}}
					/>
				</div>
				<div
					className={`blockchain-name cursor-pointer rounded-lg p-2 ${
						app.is_mobile_app ? '' : 'group-hover:text-lg'
					}`}
				>
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
					className={`delete-address cursor-pointer waves-effect rounded-lg p-2 ${
						app.is_mobile_app ? '' : 'hover:text-red-400'
					}`}
					onClick={handleBlockchainRemove}
				>
					<FontAwesomeIcon icon={faTrash} />
				</div>
			</div>
			<div className={`addresses ${collapsed && 'hidden'}`}>
				{database.address && Object.values(database.address).length !== 0 && (
					<table className="w-full border border-yellow-200 mt-2 rounded-lg text-xs lg:text-base">
						<thead>
							<tr>
								<th
									className="border border-yellow-200 cursor-pointer"
									onClick={() => toggleSort('name')}
								>
									{sortIconRender('name')} Name
								</th>
								<th
									className="border border-yellow-200 cursor-pointer"
									onClick={() => toggleSort('address_hash')}
								>
									{sortIconRender('address_hash')} Address
								</th>
								<th className="border border-yellow-200">Actions</th>
							</tr>
						</thead>
						<tbody>
							{database.address &&
								Object.values(database.address)
									.sort((a, b) => compare(asc_order, sort_criteria, a, b))
									.filter((address) => address.chain_id === chain.id)
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
						required={true}
					/>
					<Input
						name="address_hash"
						label="Address"
						value={form_data.address_hash}
						handleChange={handleChange}
						type="text"
						required={true}
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

export default BlockchainAddressGroup;
