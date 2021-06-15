import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { signOut } from 'actions/auth';

const Dashboard = () => {
	const dispatch = useDispatch();
	const history = useHistory();

	const handleSignOut = () => {
		dispatch(signOut(history));
	};

	return (
		<>
			<div>Dashboard</div>
			<button onClick={handleSignOut}>sign out button</button>
		</>
	);
};

export default Dashboard;
