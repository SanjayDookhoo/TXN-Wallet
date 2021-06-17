import React, { useState, useEffect } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import decode from 'jwt-decode';

import Auth from 'src/pages/Auth';
import Dashboard from 'src/pages/Dashboard';
import NotFound from 'src/pages/NotFound';

const App = () => {
	return (
		<BrowserRouter>
			<Switch>
				<PrivateRoute path="/" exact component={Dashboard} />
				<Route path="/auth" exact component={Auth} />
				<Route component={NotFound} />
			</Switch>
		</BrowserRouter>
	);
};

export default App;

const PrivateRoute = ({ component: Component, ...other_params }) => {
	const [signed_in, updateSignedIn] = useState(false);
	const [loading, updateLoading] = useState(true);

	useEffect(() => {
		const user = JSON.parse(localStorage.getItem('profile'));
		const token = user?.token;

		if (token) {
			const decoded_token = decode(token);

			if (decoded_token.exp * 1000 < new Date().getTime()) {
				updateSignedIn(false);
			} else {
				updateSignedIn(true);
			}
		} else {
			updateSignedIn(false);
		}

		updateLoading(false);
	}, [location]);

	return (
		<>
			{!loading && (
				<Route
					{...other_params}
					render={(props) =>
						signed_in ? (
							<Component {...props} />
						) : (
							<Redirect
								to={{
									pathname: '/auth',
									state: { from: props.location },
								}}
							/>
						)
					}
				/>
			)}
		</>
	);
};
