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
				<CustomRoute path="/" exact component={Dashboard} />
				<CustomRoute
					path="/auth"
					exact
					component={Auth}
					auth_route_type={true}
				/>
				<Route component={NotFound} />
			</Switch>
		</BrowserRouter>
	);
};

export default App;

// defaults to private route
const CustomRoute = ({
	path,
	component: Component,
	auth_route_type,
	...other_params
}) => {
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
	}, [path]);

	return (
		<>
			{!loading && (
				<Route
					{...other_params}
					render={(props) => (
						<>
							{auth_route_type && !signed_in && (
								<Component {...props} />
							)}

							{auth_route_type && signed_in && (
								<Redirect
									to={{
										pathname: '/',
										state: { from: props.location },
									}}
								/>
							)}

							{!auth_route_type && signed_in && (
								<Component {...props} />
							)}

							{!auth_route_type && !signed_in && (
								<Redirect
									to={{
										pathname: '/auth',
										state: { from: props.location },
									}}
								/>
							)}
						</>
					)}
				/>
			)}
		</>
	);
};
