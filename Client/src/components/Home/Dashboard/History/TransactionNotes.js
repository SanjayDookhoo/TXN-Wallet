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
	faTrash,
	faPlus,
} from '@fortawesome/free-solid-svg-icons';
import Button from '../../..//Button';
import { InputLabel, Select, MenuItem, FormControl } from '@material-ui/core';
import Input from '../../../Input';
import {
	databaseGet,
	databasePost,
	databaseDelete,
	databasePatch,
} from '../../../../ducks/actions/database';
import { useHistory } from 'react-router';
import { createLoadingModal, removeLoadingModal } from '../../LoadingModal';
import { useSnackbar } from 'notistack';
import { createDeleteModal } from '../../DeleteModal';

const categories = {
	housing: 'Housing',
	transportation: 'Transportation',
	food: 'Food',
	utilities: 'Utilities',
	insurance: 'Insurance',
	medical: 'medical and Healthcare',
	saving: 'Saving and Investment',
	personal: 'Personal Spending',
	entertainment: 'Recreation and Entertainment',
	miscellaneous: 'Miscellaneous',
};

const initial_general_data = {
	category: '',
	notes: '',
};

const TransactionNotes = ({ transaction_selected }) => {
	const dispatch = useDispatch();
	const history = useHistory();
	const { enqueueSnackbar } = useSnackbar();

	const app = useSelector((state) => state.app);
	const database = useSelector((state) => state.database);
	const [edit, updateEdit] = useState(false);
	const [new_transaction, updateNewTransaction] = useState(false);
	const [general_data, updateGeneralData] = useState(initial_general_data);
	const [items_data, updateItemsData] = useState([]);
	const [transaction_found, updateTransactionFound] = useState(null);

	useEffect(() => {
		if (database.transaction) {
			const found = Object.values(database.transaction).find(
				(transaction) =>
					transaction.transaction_hash === transaction_selected
			);
			updateTransactionFound(found);
		}
	}, [transaction_selected]);

	const handleSubmit = (e) => {
		e.preventDefault();

		if (new_transaction && edit) {
			// create new
			const modal = createLoadingModal();
			dispatch(
				databasePost({
					table_name: 'transaction',
					req_body: {
						inserts: [
							{
								...general_data,
								transaction_hash: transaction_selected,
							},
						],
					},
					onSuccess: (res) => {
						const transaction_id = res.result[0].id;
						updateTransactionFound({
							...general_data,
							transaction_hash: transaction_selected,
							id: transaction_id,
						});
						saveItems(transaction_id);
						history.goBack();
					},
					onFailure: (error) => {
						console.log({ error });
						enqueueSnackbar('Something went wrong', {
							variant: 'error',
						});
					},
					onFinish: (res) => {
						removeLoadingModal(modal);
					},
				})
			);
		} else if (!new_transaction && edit) {
			// edit old
			let updates = {
				[transaction_found.id]: {},
			};

			if (general_data.category !== transaction_found.category) {
				updates[transaction_found.id] = {
					...updates[transaction_found.id],
					category: general_data.category,
				};
			}
			if (general_data.notes !== transaction_found.notes) {
				updates[transaction_found.id] = {
					...updates[transaction_found.id],
					notes: general_data.notes,
				};
			}

			if (Object.values(updates[transaction_found.id]).length !== 0) {
				const modal = createLoadingModal();
				dispatch(
					databasePatch({
						table_name: 'transaction',
						req_body: {
							updates,
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
			}

			saveItems(transaction_found.id);
		}
	};

	const saveItems = (transaction_id) => {
		// handling batch edit for items
		let updates = {};
		Object.values(items_data)
			.filter((item) => !(item._deleted || item._added))
			.forEach((item) => {
				const item_updates = {};
				if (item.name !== database.item[item.id].name) {
					item_updates.name = item.name;
				}
				if (item.price !== database.item[item.id].price) {
					item_updates.price = item.price;
				}
				if (Object.entries(item_updates).length !== 0) {
					updates[item.id] = item_updates;
				}
			});
		if (Object.values(updates).length !== 0) {
			const modal = createLoadingModal();
			dispatch(
				databasePatch({
					table_name: 'item',
					req_body: {
						updates,
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
		}

		// handling batch add for items
		const inserts = Object.values(items_data)
			.filter((item) => item._added)
			.map((item) => {
				const { _added, id, ...actual_data } = item;

				return {
					...actual_data,
					transaction_id: transaction_id,
				};
			});
		if (inserts.length !== 0) {
			const modal = createLoadingModal();
			dispatch(
				databasePost({
					table_name: 'item',
					req_body: {
						inserts,
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
		}

		// handling batch remove for items
		const ids = Object.values(items_data)
			.filter((item) => item._deleted)
			.map((item) => item.id);
		if (ids.length !== 0) {
			const modal = createLoadingModal();
			dispatch(
				databaseDelete({
					table_name: 'item',
					req_body: {
						ids,
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
		}
	};

	useEffect(() => {
		if (database.transaction) {
			if (transaction_found) {
				updateEdit(false);
				updateNewTransaction(false);

				updateGeneralData(transaction_found);
				updateItemsData(database.item);
			} else {
				updateEdit(true);
				updateNewTransaction(true);

				updateGeneralData(initial_general_data);
				updateItemsData([]);
			}
		}
	}, [transaction_found, database]);

	const general_params = {
		new_transaction,
		edit,

		general_data,
		updateGeneralData,
	};

	const items_params = {
		transaction_found,
		new_transaction,
		edit,

		items_data,
		updateItemsData,
	};

	const cancelEditingExistingTransaction = () => {
		updateEdit(false);

		updateGeneralData(transaction_found);
		updateItemsData(database.item);
	};

	return (
		<div className="transaction-notes">
			<form onSubmit={handleSubmit}>
				<General {...general_params} />
				<Items {...items_params} />

				<div className="buttons flex justify-around items-center">
					{new_transaction && edit && (
						<Button variant="secondary" type="submit">
							Create
						</Button>
					)}
					{!new_transaction && edit && (
						<Button variant="secondary" type="submit">
							Save Edit
						</Button>
					)}
					{/* {new_transaction && !edit  && (
						<Button variant="secondary" type="submit" onClick={handleToggleEdit}>
							
						</Button>
					)} */}
					{!new_transaction && !edit && (
						<Button
							variant="secondary"
							onClick={() => updateEdit(true)}
						>
							Edit
						</Button>
					)}

					{new_transaction && edit && (
						<Button
							variant="white"
							onClick={() => history.goBack()}
						>
							Cancel
						</Button>
					)}
					{!new_transaction && edit && (
						<Button
							variant="white"
							onClick={cancelEditingExistingTransaction}
						>
							Cancel
						</Button>
					)}
					{/* {new_transaction && !edit  && (
						<Button variant="white" onClick={handleToggleEdit}>
							
						</Button>
					)} */}
					{!new_transaction && !edit && (
						<Button
							variant="white"
							onClick={() => history.goBack()}
						>
							Back
						</Button>
					)}
				</div>
			</form>
		</div>
	);
};

export default TransactionNotes;

const General = ({
	new_transaction,
	edit,
	general_data,
	updateGeneralData,
}) => {
	const handleTransactionDataChange = (e) =>
		updateGeneralData({
			...general_data,
			[e.target.name]: e.target.value,
		});

	return (
		<div className="transaction-notes-general">
			<FormControl className="w-full">
				<InputLabel id="category">Select Category</InputLabel>
				<Select
					labelId="category"
					name="category"
					id="category_id"
					value={general_data?.category}
					onChange={handleTransactionDataChange}
					disabled={!new_transaction && !edit}
					required={true}
				>
					{Object.entries(categories).map(([key, value]) => (
						<MenuItem key={key} value={key}>
							{value}
						</MenuItem>
					))}
				</Select>
			</FormControl>
			<Input
				name="notes"
				label="Notes"
				value={general_data?.notes}
				handleChange={handleTransactionDataChange}
				type="text"
				multiline={true}
				disabled={!new_transaction && !edit}
			/>
		</div>
	);
};

const initial_add_data = {
	name: '',
	price: 0,
};

const Items = ({
	transaction_found,
	new_transaction,
	edit,
	items_data,
	updateItemsData,
}) => {
	const [add_data, updateAddDate] = useState(initial_add_data);
	const [count, updateCount] = useState(0);

	useEffect(() => {
		updateAddDate(initial_add_data);
	}, [transaction_found]);

	const addToCurrentState = () => {
		updateItemsData({
			...items_data,
			[`_${count}`]: {
				...add_data,
				id: `_${count}`,
				_added: true,
			},
		});
		updateAddDate(initial_add_data);
		updateCount(count + 1);
	};

	const handleAddChange = (e) =>
		updateAddDate({ ...add_data, [e.target.name]: e.target.value });

	const handleEditChange = (e, id) => {
		updateItemsData({
			...items_data,
			[id]: {
				...items_data[id],
				[e.target.name]: e.target.value,
			},
		});
	};

	const handleEditDelete = (id) => {
		const callback = () =>
			updateItemsData({
				...items_data,
				[id]: {
					...items_data[id],
					_deleted: true,
				},
			});

		createDeleteModal({ callback });
	};

	return (
		<div className="items">
			<table className="w-full rounded-lg">
				<thead>
					<tr>
						<th>Item</th>
						<th>Price</th>
						<th>Option</th>
					</tr>
				</thead>
				<tbody>
					{Object.values(items_data)
						.filter(
							(item) =>
								item.transaction_id === transaction_found?.id ||
								item._added
						)
						.filter((item) => !item._deleted)
						.map((item) => (
							<tr key={item.id}>
								<td>
									<Input
										name="name"
										label="Item Name"
										value={item.name}
										handleChange={(e) =>
											handleEditChange(e, item.id)
										}
										type="text"
										disabled={!new_transaction && !edit}
										required={true}
									/>
								</td>
								<td>
									<Input
										name="price"
										label="Price"
										value={item.price}
										handleChange={(e) =>
											handleEditChange(e, item.id)
										}
										type="number"
										disabled={!new_transaction && !edit}
										required={true}
									/>
								</td>
								<td>
									<div
										className="address-delete flex justify-center items-center cursor-pointer waves-effect rounded-lg p-2 hover:text-red-400"
										onClick={() =>
											handleEditDelete(item.id)
										}
									>
										<FontAwesomeIcon icon={faTrash} />
									</div>
								</td>
							</tr>
						))}
					<tr>
						<td>
							<Input
								name="name"
								label="Item Name"
								value={add_data.name}
								handleChange={handleAddChange}
								type="text"
								required={false}
								disabled={!new_transaction && !edit}
							/>
						</td>
						<td>
							<Input
								name="price"
								label="Price"
								value={add_data.price}
								handleChange={handleAddChange}
								type="number"
								required={false}
								disabled={!new_transaction && !edit}
							/>
						</td>
						<td>
							<div
								className="address-delete flex justify-center items-center cursor-pointer waves-effect rounded-lg p-2 hover:text-yellow-400"
								onClick={addToCurrentState}
							>
								<FontAwesomeIcon icon={faPlus} />
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
};
