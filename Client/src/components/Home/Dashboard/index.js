import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faQrcode,
	faCamera,
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
		<MainContainer
			body={
				<>
					{(app.dashboard_item === 'portfolio' ||
						app.dashboard_item === '') && <Portfolio />}

					{app.dashboard_item === 'analytics' && <Analytics />}
					{app.dashboard_item === 'POS_setup' && <POSSetup />}
					{app.dashboard_item === 'history' && <History />}
					{app.dashboard_item === 'settings' && <Settings />}
				</>
			}
			navbar={
				<>
					<NavButton
						active={app.dashboard_item === 'scanning'}
						scan_button={true}
						onClick={() => handleNavButtonClick('scanning')}
					>
						<FontAwesomeIcon icon={faQrcode} />
					</NavButton>
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
				</>
			}
		/>
	);
};

export default Dashboard;
