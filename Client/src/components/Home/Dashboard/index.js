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
import { updateApp } from '../../../ducks/actions/app';

import QRScanner from './QRScanner';
import Analytics from './Analytics';
import History from './History';
import Portfolio from './Portfolio';
import POSSetup from './POSSetup';
import Settings from './Settings';

const Dashboard = () => {
	const dispatch = useDispatch();
	const history = useHistory();
	const app = useSelector((state) => state.app);

	const handleNav = (dashboard_item) => {
		dispatch(updateApp({ dashboard_item }));
		if (history.location.pathname === '/') {
			history.push('/active');
		}
	};

	// swiping navigation for mobile
	useEffect(() => {
		if (app.is_mobile_app) {
			let original_screen_x;
			let mouse_down = false;
			let direction = null;

			const dashboardItemIndex = () => {
				if (app.dashboard_item === '') {
					if (app.is_mobile_app) return 0;
					else return 1;
				}
				return dashboard_items.findIndex(
					(dashboard_item) =>
						dashboard_item.name === app.dashboard_item
				);
			};

			const mouseMove = (event) => {
				if (mouse_down) {
					if (!direction && event.screenX > original_screen_x) {
						direction = 'right';
					}

					if (!direction && event.screenX < original_screen_x) {
						direction = 'left';
					}

					if (
						direction === 'right' &&
						event.screenX < original_screen_x
					) {
						direction = null;
					}

					if (
						direction === 'left' &&
						event.screenX > original_screen_x
					) {
						direction = null;
					}

					if (direction && event.screenX > original_screen_x + 100) {
						mouse_down = false;
						direction = null;

						const index = dashboardItemIndex();
						if (index !== dashboard_items.length - 1) {
							dispatch(
								updateApp({
									dashboard_item:
										dashboard_items[index + 1].name,
								})
							);
						}

						console.log('swipe right');
					}

					if (direction && event.screenX < original_screen_x - 100) {
						mouse_down = false;
						direction = null;

						const index = dashboardItemIndex();
						if (
							(app.is_mobile_app && index !== 0) ||
							(!app.is_mobile_app && index !== 1)
						) {
							dispatch(
								updateApp({
									dashboard_item:
										dashboard_items[index - 1].name,
								})
							);
						}

						console.log('swipe left');
					}
				}
			};

			const mouseDown = (event) => {
				original_screen_x = event.screenX;
				mouse_down = true;
				direction = null;
			};
			const mouseUp = (event) => {
				mouse_down = false;
			};

			window.addEventListener('mousemove', mouseMove);
			window.addEventListener('mousedown', mouseDown);
			window.addEventListener('mouseup', mouseUp);

			return () => {
				//removing old event listeners
				window.removeEventListener('mousemove', mouseMove);
				window.removeEventListener('mousedown', mouseDown);
				window.removeEventListener('mouseup', mouseUp);
			};
		}
	}, [app]);

	const dashboard_items = [
		{
			name: 'qr_scanning',
			condition: (app_dashboard_item) =>
				app_dashboard_item === 'qr_scanning',
			icon: faQrcode,
			component: <QRScanner />,
		},
		{
			name: 'portfolio',
			condition: (app_dashboard_item) =>
				app_dashboard_item === 'portfolio' || app_dashboard_item === '',
			icon: faMoneyBill,
			component: <Portfolio />,
		},
		{
			name: 'analytics',
			condition: (app_dashboard_item) =>
				app_dashboard_item === 'analytics',
			icon: faChartLine,
			component: <Analytics />,
		},
		{
			name: 'POS_setup',
			condition: (app_dashboard_item) =>
				app_dashboard_item === 'POS_setup',
			icon: faCalculator,
			component: <POSSetup />,
		},
		{
			name: 'history',
			condition: (app_dashboard_item) => app_dashboard_item === 'history',
			icon: faHistory,
			component: <History />,
		},
		{
			name: 'settings',
			condition: (app_dashboard_item) =>
				app_dashboard_item === 'settings',
			icon: faCog,
			component: <Settings />,
		},
	];

	useEffect(() => {
		console.log({ app });
	}, [app]);

	return (
		<MainContainer
			body={
				dashboard_items.find((dashboard_item) =>
					dashboard_item.condition(app.dashboard_item)
				)?.component
			}
			navbar={
				<>
					{dashboard_items
						.filter(
							(dashboard_item) =>
								(!app.is_mobile_app &&
									dashboard_item.name !== 'qr_scanning') ||
								app.is_mobile_app
						)
						.map((dashboard_item, i) => (
							<NavButton
								key={i}
								active={dashboard_item.condition(
									app.dashboard_item
								)}
								onClick={() => handleNav(dashboard_item.name)}
							>
								<FontAwesomeIcon icon={dashboard_item.icon} />
							</NavButton>
						))}
				</>
			}
		/>
	);
};

export default Dashboard;
