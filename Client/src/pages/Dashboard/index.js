import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faSignOutAlt,
	faCog,
	faChartLine,
	faHistory,
	faMoneyBill,
	faCalculator,
} from '@fortawesome/free-solid-svg-icons';
import MainContainer from '../../components/MainContainer';
import NavButton from '../../components/NavButton';
import { signOut } from '../../ducks/actions/auth';
import {
	databaseGet,
	databasePost,
	databasePatch,
	databaseDelete,
} from '../../ducks/actions/database';
import logo from '../../assets/logo.svg';

const Dashboard = () => {
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
		<MainContainer>
			<div className="navbar w-24 flex flex-col justify-between items-center text-5xl">
				<div>
					<button className="waves-effect rounded-br-lg shadow ripple hover:shadow-lg focus:outline-none bg-yellow-500">
						<img src={logo} />
					</button>
				</div>
				<div className="flex flex-col justify-between items-center">
					<NavButton>
						<FontAwesomeIcon icon={faMoneyBill} />
					</NavButton>
					<NavButton>
						<FontAwesomeIcon icon={faChartLine} />
					</NavButton>
					<NavButton>
						<FontAwesomeIcon icon={faCalculator} />
					</NavButton>
					<NavButton>
						<FontAwesomeIcon icon={faHistory} />
					</NavButton>
					<NavButton active={true}>
						<FontAwesomeIcon icon={faCog} />
					</NavButton>
				</div>
				<div>
					<NavButton onClick={handleSignOut}>
						<FontAwesomeIcon icon={faSignOutAlt} />
					</NavButton>
				</div>
			</div>
			<div className="content p-16 border-l-4 border-gray-600 flex-grow">
				<div className="content-heading text-5xl pb-4">
					content heading
				</div>
				<div className="content-body">content body</div>
			</div>
		</MainContainer>
	);
};

export default Dashboard;
