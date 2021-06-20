import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { reducers } from './ducks/reducers';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { SnackbarProvider } from 'notistack';

const store = createStore(reducers, compose(applyMiddleware(thunk)));

const renderReactDom = ({ is_mobile_app }) => {
	ReactDOM.render(
		<Provider store={store}>
			<SnackbarProvider maxSnack={3}>
				<React.StrictMode>
					<App is_mobile_app={is_mobile_app} />
				</React.StrictMode>
			</SnackbarProvider>
		</Provider>,
		document.getElementById('root')
	);
};

if (window.cordova) {
	document.addEventListener(
		'deviceready',
		() => {
			console.log('deviceready');
			renderReactDom({ is_mobile_app: true });
		},
		false
	);
} else {
	console.log('normal');
	renderReactDom({ is_mobile_app: false });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
