import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
	BrowserRouter,
	Switch,
	Route,
	useHistory,
	useLocation,
} from 'react-router-dom';
import decode from 'jwt-decode';

import { signOut } from 'actions/auth';

import Auth from 'src/pages/Auth';
import Dashboard from 'src/pages/Dashboard';

const App = () => {
	return (
		<BrowserRouter>
			<AuthHandler />
			<Switch>
				<Route path="/" exact component={Dashboard} />
				<Route path="/auth" exact component={Auth} />
			</Switch>
		</BrowserRouter>
	);
};

export default App;

const AuthHandler = () => {
	const dispatch = useDispatch();
	const location = useLocation();
	const history = useHistory();

	const logout = () => {
		dispatch(signOut({ onSuccess: () => history.push('/auth') }));
	};

	useEffect(() => {
		const user = JSON.parse(localStorage.getItem('profile'));
		const token = user?.token;

		if (token) {
			const decoded_token = decode(token);

			if (decoded_token.exp * 1000 < new Date().getTime()) {
				logout();
			}
		}

		if (location.pathname !== '/auth' && !token) {
			logout();
		}
	}, [location]);

	return <></>;
};
