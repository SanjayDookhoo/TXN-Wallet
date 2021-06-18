import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { signOut } from '../../ducks/actions/auth';
import {
	databaseGet,
	databasePost,
	databasePatch,
	databaseDelete,
} from '../../ducks/actions/database';

const Dashboard = () => {
	const dispatch = useDispatch();
	const history = useHistory();
	const database = useSelector((state) => state.database);

	useEffect(() => {
		console.log({ database });
	}, [database]);

	const handleSignOut = () => {
		dispatch(signOut({ onSuccess: () => history.push('/auth') }));
	};

	const handleGet = () => {
		dispatch(
			databaseGet({
				table_name: 'customers',
				req_params: {
					name: 'sanjay',
				},
			})
		);
	};
	const handlePost = () => {
		dispatch(
			databasePost({
				table_name: 'customers',
				req_body: {
					inserts: [
						{
							name: 'sanjay',
							address: 'orange',
							age: 12,
						},
					],
				},
			})
		);
	};
	const handlePatch = () => {
		dispatch(
			databasePatch({
				table_name: 'customers',
				req_body: {
					updates: {
						1: {
							name: 'bobss',
							age: 13,
						},
					},
				},
			})
		);
	};
	const handleDelete = () => {
		dispatch(
			databaseDelete({
				table_name: 'customers',
				req_body: {
					ids: [3],
				},
			})
		);
	};

	return (
		<>
			<div className="text-red-500">Dashboard</div>
			<button onClick={handleSignOut}>sign out button</button> <br />
			<button onClick={handleGet}>get button</button> <br />
			<button onClick={handlePost}>post button</button> <br />
			<button onClick={handlePatch}>patch button</button> <br />
			<button onClick={handleDelete}>delete button</button> <br />
		</>
	);
};

export default Dashboard;
