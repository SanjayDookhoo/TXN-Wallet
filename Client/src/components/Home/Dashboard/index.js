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
import MainContainer from '../MainContainer';
import NavButton from '../NavButton';
import { signOut } from '../../../ducks/actions/auth';
import { updateApp } from '../../../ducks/actions/app';
import logo from '../../../assets/logo.svg';

import Analytics from './Analytics';
import History from './History';
import Portfolio from './Portfolio';
import POSSetup from './POSSetup';
import Settings from './Settings';

const Dashboard = () => {
	const dispatch = useDispatch();
	const history = useHistory();
	const app = useSelector((state) => state.app);

	const handleSignOut = () => {
		dispatch(signOut({}));
	};

	const handleNavButtonClick = (dashboard_item) => {
		dispatch(updateApp({ dashboard_item }));
		if (history.location.pathname === '/') {
			history.push('/active');
		}
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
					<NavButton
						active={
							app.dashboard_item === 'portfolio' ||
							app.dashboard_item === ''
						}
						onClick={() => handleNavButtonClick('portfolio')}
					>
						<FontAwesomeIcon icon={faMoneyBill} />
					</NavButton>
					<NavButton
						active={app.dashboard_item === 'analytics'}
						onClick={() => handleNavButtonClick('analytics')}
					>
						<FontAwesomeIcon icon={faChartLine} />
					</NavButton>
					<NavButton
						active={app.dashboard_item === 'POS_setup'}
						onClick={() => handleNavButtonClick('POS_setup')}
					>
						<FontAwesomeIcon icon={faCalculator} />
					</NavButton>
					<NavButton
						active={app.dashboard_item === 'history'}
						onClick={() => handleNavButtonClick('history')}
					>
						<FontAwesomeIcon icon={faHistory} />
					</NavButton>
					<NavButton
						active={app.dashboard_item === 'settings'}
						onClick={() => handleNavButtonClick('settings')}
					>
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
				{(app.dashboard_item === 'portfolio' ||
					app.dashboard_item === '') && <Portfolio />}

				{app.dashboard_item === 'analytics' && <Analytics />}
				{app.dashboard_item === 'POS_setup' && <POSSetup />}
				{app.dashboard_item === 'history' && <History />}
				{app.dashboard_item === 'settings' && <Settings />}
			</div>
		</MainContainer>
	);
};

export default Dashboard;
