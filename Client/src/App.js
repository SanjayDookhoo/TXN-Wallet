import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
	BrowserRouter,
	Switch,
	Route,
	useHistory,
	useLocation,
} from 'react-router-dom';
import decode from 'jwt-decode';

import { signOut } from 'actions/auth';

import Auth from 'src/components/Auth';
import Dashboard from 'src/components/Dashboard';

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

	const [user, updateUser] = useState(
		JSON.parse(localStorage.getItem('profile'))
	);

	const logout = () => {
		dispatch(signOut({ history }));

		updateUser(null);
	};

	useEffect(() => {
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

		updateUser(JSON.parse(localStorage.getItem('profile')));
	}, [location]);

	return <></>;
};
