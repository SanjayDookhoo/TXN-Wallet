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
import Button from '../../..//Button';
import { InputLabel, Select, MenuItem } from '@material-ui/core';
import Input from '../../../Input';

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
const TransactionNotes = ({ transaction_selected }) => {
	const app = useSelector((state) => state.app);
	const [edit, updateEdit] = useState(false);
	const [category, updateCategory] = useState(false);

	const handleToggleEdit = () => {
		updateEdit(!edit);
	};

	const handleSubmit = () => {
		//updateEdit(!edit)
	};

	return (
		<div className="transaction-notes">
			{transaction_selected}

			<form onSubmit={handleSubmit}>
				<div>
					<InputLabel id="category">Select Category</InputLabel>
					<Select
						labelId="category"
						label="Please select"
						id="category_id"
						value={category}
						onChange={updateCategory}
						className="w-full"
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
				{/* <Input
					name="email"
					label="Email Address"
					value={form_data.email}
					handleChange={handleChange}
					type="text"
					multiline={true}
				/> */}

				<Button variant="white" onClick={handleToggleEdit}>
					{edit ? 'Cancel Edit' : 'Edit'}
				</Button>
				{edit && (
					<Button variant="primary" type="submit">
						{' '}
						Save{' '}
					</Button>
				)}
			</form>
		</div>
	);
};

export default TransactionNotes;
