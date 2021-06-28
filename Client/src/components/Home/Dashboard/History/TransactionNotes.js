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
import { InputLabel, Select, MenuItem } from '@material-ui/core';
import Input from '../../../Input';
import {
	databaseGet,
	databasePost,
	databaseDelete,
	databasePatch,
} from '../../../../ducks/actions/database';
import { useHistory } from 'react-router';
import { createLoadingModal, removeLoadingModal } from '../../LoadingModal';

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
	category: -1,
	notes: '',
};

const TransactionNotes = ({ transaction_selected }) => {
	const dispatch = useDispatch();
	const history = useHistory();
	const app = useSelector((state) => state.app);
	const database = useSelector((state) => state.database);
	const [edit, updateEdit] = useState(false);
	const [new_transaction, updateNewTransaction] = useState(false);
	const [general_data, updateGeneralData] = useState(initial_general_data);
	const [images_data, updateImagesData] = useState([]);
	const [items_data, updateItemsData] = useState([]);

	useEffect(() => {
		console.log({ items_data });
	}, [items_data]);

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
						const tx_hash = res.result[0].id;
						saveItems(tx_hash);
						history.goBack();
					},
					onFinish: (res) => {
						removeLoadingModal(modal);
					},
				})
			);
		} else if (!new_transaction && edit) {
			// edit old
			console.log({ general_data });
			const found = Object.values(database.transaction).find(
				(transaction) =>
					transaction.transaction_hash === transaction_selected
			);

			let updates = {
				[found.id]: {},
			};

			if (general_data.category !== found.category) {
				updates[found.id] = {
					...updates[found.id],
					category: general_data.category,
				};
			}
			if (general_data.notes !== found.notes) {
				updates[found.id] = {
					...updates[found.id],
					notes: general_data.notes,
				};
			}

			if (Object.values(updates[found.id]).length !== 0) {
				const modal = createLoadingModal();
				dispatch(
					databasePatch({
						table_name: 'transaction',
						req_body: {
							updates,
						},
						onFinish: () => {
							removeLoadingModal(modal);
						},
					})
				);
			}

			saveItems(transaction_selected);
		}
	};

	const saveItems = (tx_hash) => {
		const found = Object.values(database.transaction).find(
			(transaction) => transaction.transaction_hash === tx_hash
		);

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
					console.log({ item_updates });
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
				console.log(item);
				const { _added, id, ...actual_data } = item;

				return {
					...actual_data,
					transaction_id: found.id,
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
					onFinish: () => {
						removeLoadingModal(modal);
					},
				})
			);
		}
	};

	useEffect(() => {
		if (database.transaction) {
			const found = Object.values(database.transaction).find(
				(transaction) =>
					transaction.transaction_hash === transaction_selected
			);
			if (found) {
				updateEdit(false);
				updateNewTransaction(false);

				updateGeneralData(found);
				updateItemsData(database.item);
				updateImagesData(database.image);
			} else {
				updateEdit(true);
				updateNewTransaction(true);

				updateGeneralData(initial_general_data);
				updateItemsData([]);
				updateImagesData([]);
			}
		}
	}, [transaction_selected, database]);

	// useEffect(() => {
	// 	console.log({ general_data });
	// }, [general_data]);

	const general_params = {
		new_transaction,
		edit,

		general_data,
		updateGeneralData,
	};

	const images_params = {
		new_transaction,
		edit,

		images_data,
		updateImagesData,
	};

	const items_params = {
		new_transaction,
		edit,

		items_data,
		updateItemsData,
	};

	const cancelEditingExistingTransaction = () => {
		updateEdit(false);

		const found = Object.values(database.transaction).find(
			(transaction) =>
				transaction.transaction_hash === transaction_selected
		);
		updateGeneralData(found);
		updateItemsData(database.item);
		updateImagesData(database.image);
	};

	return (
		<div className="transaction-notes">
			<form onSubmit={handleSubmit}>
				<General {...general_params} />
				<Items {...items_params} />
				<Images {...images_params} />

				{new_transaction && edit && (
					<Button variant="primary" type="submit">
						Create
					</Button>
				)}
				{!new_transaction && edit && (
					<Button variant="primary" type="submit">
						Save Edit
					</Button>
				)}
				{/* {new_transaction && !edit  && (
					<Button variant="primary" type="submit" onClick={handleToggleEdit}>
						
					</Button>
				)} */}
				{!new_transaction && !edit && (
					<Button variant="primary" onClick={() => updateEdit(true)}>
						Edit
					</Button>
				)}

				{new_transaction && edit && (
					<Button variant="white" onClick={() => history.goBack()}>
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
					<Button variant="white" onClick={() => history.goBack()}>
						Back
					</Button>
				)}
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
			<div className="">
				<InputLabel id="category">Select Category</InputLabel>
				<Select
					labelId="category"
					name="category"
					label="Please select"
					id="category_id"
					value={general_data?.category}
					onChange={handleTransactionDataChange}
					className="w-full"
					disabled={!new_transaction && !edit}
				>
					<MenuItem value="-1" disabled>
						Please select
					</MenuItem>
					{Object.entries(categories).map(([key, value]) => (
						<MenuItem key={key} value={key}>
							{value}
						</MenuItem>
					))}
				</Select>
			</div>
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

const Items = ({ new_transaction, edit, items_data, updateItemsData }) => {
	const [add_data, updateAddDate] = useState(initial_add_data);
	const [count, updateCount] = useState(0);

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
		updateItemsData({
			...items_data,
			[id]: {
				...items_data[id],
				_deleted: true,
			},
		});
	};

	return (
		<div className="items">
			<table className="w-full">
				<thead>
					<tr>
						<th>Item</th>
						<th>Price</th>
						<th>Option</th>
					</tr>
				</thead>
				<tbody>
					{Object.values(items_data)
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
									/>
								</td>
								<td>
									<div
										className="address-delete cursor-pointer waves-effect rounded-lg p-2 hover:text-red-400"
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
								className="address-delete cursor-pointer waves-effect rounded-lg p-2 hover:text-red-400"
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

const Images = ({ new_transaction, edit, images_data, updateImagesData }) => {
	return <div className="images"></div>;
};
