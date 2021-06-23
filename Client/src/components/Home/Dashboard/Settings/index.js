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
import covalentAPI from '../../../../ducks/api/covalent';

const Settings = () => {
	const dispatch = useDispatch();
	const [chains, updateChains] = useState([]);

	useEffect(async () => {
		const { data, status } = await covalentAPI.get(`/chains/`, {
			params: {},
		});
		console.log({ data });
	}, []);

	return (
		<>
			<ContentHeading>Settings</ContentHeading>
			<ContentBody>Body</ContentBody>
		</>
	);
};

export default Settings;
