import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	BrowserRouter,
	HashRouter,
	Switch,
	Route,
	Redirect,
} from 'react-router-dom';
import Home from '../src/components/Home';
import NotFound from '../src/components/NotFound';
import { routeStateApp } from '../src/ducks/actions/app';

const App = ({ is_mobile_app }) => {
	const state = useSelector((state) => state);
	const MyRouter = is_mobile_app ? HashRouter : BrowserRouter; // cordova app works with HashRouter, BrowserRouter URL is familiar to desktop users

	useEffect(() => {
		console.log({ state });
	}, [state]);

	const custom_route_params = {
		exact: true,
		component: Home,
		is_mobile_app,
	};

	return (
		<MyRouter>
			<Switch>
				<CustomRoute path="/" exact {...custom_route_params} />
				<CustomRoute path="/active" {...custom_route_params} />
				<CustomRoute path="/scanning" {...custom_route_params} />
				<Route component={NotFound} />
			</Switch>
		</MyRouter>
	);
};

export default App;

// defaults to private route
const CustomRoute = ({
	path,
	component: Component,
	is_mobile_app,
	...other_params
}) => {
	const dispatch = useDispatch();

	useEffect(() => {
		console.log({ is_mobile_app });
		dispatch(routeStateApp({ path, is_mobile_app }));
	}, [path, is_mobile_app]);

	return (
		<Route {...other_params} render={(props) => <Component {...props} />} />
	);
};
