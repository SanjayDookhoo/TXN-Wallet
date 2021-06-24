import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faExclamationTriangle,
	faCog,
	faChartLine,
	faHistory,
	faMoneyBill,
	faCalculator,
} from '@fortawesome/free-solid-svg-icons';
import { useSnackbar } from 'notistack';
import MainContainer from '../MainContainer';
import NavButton from '../NavButton';
import { updateApp } from '../../../ducks/actions/app';

import Analytics from './Analytics';
import History from './History';
import Portfolio from './Portfolio';
import Notifications from './Notifications';
import Settings from './Settings';

import covalentAPI from '../../../ducks/api/covalent';
import { DeleteModal } from '../DeleteModal';

const Dashboard = () => {
	const dispatch = useDispatch();
	const history = useHistory();
	const { enqueueSnackbar } = useSnackbar();

	const [chains, updateChains] = useState([]);
	const app = useSelector((state) => state.app);

	// get covalent data
	useEffect(async () => {
		try {
			const { data, status } = await covalentAPI.get(`/chains/`, {
				params: {},
			});
			const arr = data.data.items.filter(
				(item) => !item.label.toLowerCase().includes('testnet')
			);
			updateChains(arr);
		} catch (error) {
			console.log({ error });
			enqueueSnackbar('Something went wrong', {
				variant: 'error',
			});
		}
	}, []);

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
					return 0;
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
						if (index !== 0) {
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

	const dashboard_item_params = {
		chains,
	};

	const dashboard_items = [
		{
			name: 'portfolio',
			condition: (app_dashboard_item) =>
				app_dashboard_item === 'portfolio' || app_dashboard_item === '',
			icon: faMoneyBill,
			component: <Portfolio {...dashboard_item_params} />,
		},
		{
			name: 'analytics',
			condition: (app_dashboard_item) =>
				app_dashboard_item === 'analytics',
			icon: faChartLine,
			component: <Analytics {...dashboard_item_params} />,
		},
		{
			name: 'notifications',
			condition: (app_dashboard_item) =>
				app_dashboard_item === 'notifications',
			icon: faExclamationTriangle,
			component: <Notifications {...dashboard_item_params} />,
		},
		{
			name: 'history',
			condition: (app_dashboard_item) => app_dashboard_item === 'history',
			icon: faHistory,
			component: <History {...dashboard_item_params} />,
		},
		{
			name: 'settings',
			condition: (app_dashboard_item) =>
				app_dashboard_item === 'settings',
			icon: faCog,
			component: <Settings {...dashboard_item_params} />,
		},
	];

	useEffect(() => {
		console.log({ app });
	}, [app]);

	return (
		<>
			<MainContainer
				body={
					dashboard_items.find((dashboard_item) =>
						dashboard_item.condition(app.dashboard_item)
					)?.component
				}
				navbar={
					<>
						{dashboard_items.map((dashboard_item, i) => (
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
			<DeleteModal />
		</>
	);
};

export default Dashboard;
