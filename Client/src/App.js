import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	BrowserRouter,
	HashRouter,
	Switch,
	Route,
	Redirect,
	useHistory,
} from 'react-router-dom';
import Home from '../src/components/Home';
import { updateApp } from '../src/ducks/actions/app';

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
				<CustomRoute {...custom_route_params} />
			</Switch>
		</MyRouter>
	);
};

export default App;

// defaults to private route
const CustomRoute = ({
	component: Component,
	is_mobile_app,
	...other_params
}) => {
	const app = useSelector((state) => state.app);
	const dispatch = useDispatch();
	const history = useHistory();
	const valid_paths = ['/', '/chart', '/transaction_notes'];
	const [valid_path, updateValidPath] = useState(false);

	useEffect(() => {
		if (!app.loaded) {
			dispatch(
				updateApp({
					loaded: true,
					is_mobile_app,
				})
			);
			history.replace('/');
		}
	}, [other_params.location.pathname, app, is_mobile_app]);

	useEffect(() => {
		let pathname = other_params.location.pathname;
		if (valid_paths.includes(pathname)) {
			updateValidPath(true);
		} else {
			updateValidPath(false);
		}
	}, [other_params.location.pathname]);

	return (
		<>
			{valid_path && (
				<Route
					{...other_params}
					render={(props) => <Component {...props} />}
				/>
			)}
		</>
	);
};
