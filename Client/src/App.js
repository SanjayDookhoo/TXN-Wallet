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

const App = ({ cordova }) => {
	const state = useSelector((state) => state);
	const MyRouter = cordova ? HashRouter : BrowserRouter; // cordova works with HashRouter, BrowserRouter URL is familiar to desktop users

	useEffect(() => {
		console.log({ state });
	}, [state]);

	return (
		<MyRouter>
			<Switch>
				<CustomRoute path="/" exact component={Home} />
				<CustomRoute path="/active" exact component={Home} />
				<CustomRoute path="/scanning" exact component={Home} />
				<Route component={NotFound} />
			</Switch>
		</MyRouter>
	);
};

export default App;

// defaults to private route
const CustomRoute = ({ path, component: Component, ...other_params }) => {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(routeStateApp({ path }));
	}, [path]);

	return (
		<Route {...other_params} render={(props) => <Component {...props} />} />
	);
};
