import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { signOut } from '../../ducks/actions/auth';
import {
	databaseGet,
	databasePost,
	databasePatch,
	databaseDelete,
} from '../../ducks/actions/database';

const Testing = () => {
	const dispatch = useDispatch();
	const history = useHistory();
	const database = useSelector((state) => state.database);

	useEffect(() => {
		console.log({ database });
	}, [database]);

	const handleSignOut = () => {
		dispatch(signOut({ onSuccess: () => history.push('/auth') }));
	};

	const handleGet = () => {
		dispatch(
			databaseGet({
				table_name: 'customers',
				req_params: {
					name: 'sanjay',
				},
			})
		);
	};
	const handlePost = () => {
		dispatch(
			databasePost({
				table_name: 'customers',
				req_body: {
					inserts: [
						{
							name: 'sanjay',
							address: 'orange',
							age: 12,
						},
					],
				},
			})
		);
	};
	const handlePatch = () => {
		dispatch(
			databasePatch({
				table_name: 'customers',
				req_body: {
					updates: {
						1: {
							name: 'bobss',
							age: 13,
						},
					},
				},
			})
		);
	};
	const handleDelete = () => {
		dispatch(
			databaseDelete({
				table_name: 'customers',
				req_body: {
					ids: [3],
				},
			})
		);
	};

	const handleQRCodeScan = () => {
		window.QRScanner.scan(displayContents);

		function displayContents(err, text) {
			if (err) {
				// an error occurred, or the scan was canceled (error code `6`)
				console.log(err);
			} else {
				// The scan completed, display the contents of the QR code:
				console.log(text);
				window.QRScanner.destroy((status) => {
					console.log(status);
				});
			}
		}
		window.QRScanner.show();
	};

	return (
		<>
			<div className="text-red-500">Dashboard</div>
			<button onClick={handleSignOut}>sign out button</button> <br />
			<button onClick={handleGet}>get button</button> <br />
			<button onClick={handlePost}>post button</button> <br />
			<button onClick={handlePatch}>patch button</button> <br />
			<button onClick={handleDelete}>delete button</button> <br />
			<button onClick={handleQRCodeScan}>delete button</button> <br />
		</>
	);
};

export default Testing;
