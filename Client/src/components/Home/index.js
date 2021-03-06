import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import decode from 'jwt-decode';

import Auth from './Auth';
import Dashboard from './Dashboard';
import { DeleteModal } from './DeleteModal';
import { LoadingModal } from './LoadingModal';

const Home = () => {
	const auth = useSelector((state) => state.auth);
	const app = useSelector((state) => state.app);
	const [signed_in, updateSignedIn] = useState(false);

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
	}, [app, auth]);

	return (
		<>
			{app.loaded && <>{signed_in ? <Dashboard /> : <Auth />}</>}
			<DeleteModal />
			<LoadingModal />
		</>
	);
};

export default Home;
