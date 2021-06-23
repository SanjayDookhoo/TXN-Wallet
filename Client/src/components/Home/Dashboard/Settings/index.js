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
import { databaseGet } from '../../../../ducks/actions/database';
import { InputLabel, Select, MenuItem } from '@material-ui/core';

const Settings = ({ chains }) => {
	const dispatch = useDispatch();
	const database = useSelector((state) => state.database);
	const user = JSON.parse(localStorage.getItem('profile'));
	const [selector_chains, updateChains] = useState({});
	const [value, updateValue] = useState('');

	useEffect(() => {
		console.log({ chains });
	}, [chains]);

	useEffect(() => {
		console.log({ database });
	}, [database]);

	useEffect(() => {
		dispatch(
			databaseGet({
				table_name: 'chain',
				req_params: {
					created_by_user: user.result.id,
				},
			})
		);
	}, []);

	return (
		<>
			<ContentHeading>Settings</ContentHeading>
			<ContentBody>
				<InputLabel id="label">Age</InputLabel>
				<Select
					labelId="label"
					id="select"
					value={value}
					onChange={(e) => updateValue(e.target.value)}
				>
					<MenuItem value="" disabled>
						Please select
					</MenuItem>
					<MenuItem value="10">Ten</MenuItem>
					<MenuItem value="20">Twenty</MenuItem>
				</Select>
			</ContentBody>
		</>
	);
};

export default Settings;
