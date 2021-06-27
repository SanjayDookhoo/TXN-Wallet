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

import History from './History';
import Portfolio from './Portfolio';
import Settings from './Settings';

import covalentAPI from '../../../ducks/api/covalent';

const Dashboard = () => {
	const dispatch = useDispatch();
	const history = useHistory();
	const { enqueueSnackbar } = useSnackbar();

	const [chains, updateChains] = useState([]);
	const [chart_touch_start, updateChartTouchstart] = useState(null);
	const [dashboard_item, updateDashboardItem] = useState('');
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

	const handleNav = (new_dashboard_item) => {
		updateDashboardItem(new_dashboard_item);
		if (history.location.pathname !== '/') {
			history.goBack('/');
		}
	};

	// swiping navigation for mobile
	useEffect(() => {
		if (app.is_mobile_app) {
			let original_screen_x;
			let touch_down = false;
			let direction = null;

			const dashboardItemIndex = () => {
				if (dashboard_item === '') {
					return 0;
				}
				return list_dashboard_items.findIndex(
					(list_dashboard_item) =>
						list_dashboard_item.name === dashboard_item
				);
			};

			const touchmove = (event) => {
				const curr_screenX = event.changedTouches[0].screenX;
				// console.log({ original_screen_x, curr_screenX });
				if (touch_down) {
					if (!direction && curr_screenX > original_screen_x) {
						direction = 'right';
					}

					if (!direction && curr_screenX < original_screen_x) {
						direction = 'left';
					}

					if (
						direction === 'right' &&
						curr_screenX < original_screen_x
					) {
						direction = null;
					}

					if (
						direction === 'left' &&
						curr_screenX > original_screen_x
					) {
						direction = null;
					}

					if (direction && curr_screenX > original_screen_x + 100) {
						touch_down = false;
						direction = null;

						const index = dashboardItemIndex();
						if (index !== dashboard_items.length - 1) {
							updateDashboardItem(
								dashboard_items[index + 1].name
							);
						}

						// console.log('swipe right');
					}

					if (direction && curr_screenX < original_screen_x - 100) {
						touch_down = false;
						direction = null;

						const index = dashboardItemIndex();
						if (index !== 0) {
							updateDashboardItem(
								dashboard_items[index - 1].name
							);
						}

						// console.log('swipe left');
					}
				}
			};

			const touchstart = (event) => {
				const curr_screenX = event.changedTouches[0].screenX;
				if (curr_screenX === chart_touch_start) return; // allows chart touch to work and not conflict with gesture swipe, this charting library seems to use a further up event listener so an event stop propagation wasnt working

				original_screen_x = curr_screenX;
				touch_down = true;
				direction = null;
			};
			const touchend = (event) => {
				touch_down = false;
			};

			window.addEventListener('touchmove', touchmove);
			window.addEventListener('touchend', touchend);
			window.addEventListener('touchstart', touchstart);

			return () => {
				//removing old event listeners
				window.removeEventListener('touchmove', touchmove);
				window.removeEventListener('touchend', touchend);
				window.removeEventListener('touchstart', touchstart);
			};
		}
	}, [app, chart_touch_start]);

	const dashboard_item_params = {
		chains,
	};

	const list_dashboard_items = [
		{
			name: 'portfolio',
			condition: (app_dashboard_item) =>
				app_dashboard_item === 'portfolio' || app_dashboard_item === '',
			icon: faMoneyBill,
			component: (
				<Portfolio
					{...dashboard_item_params}
					updateChartTouchstart={updateChartTouchstart}
				/>
			),
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
					list_dashboard_items.find((list_dashboard_item) =>
						list_dashboard_item.condition(dashboard_item)
					)?.component
				}
				navbar={
					<>
						{list_dashboard_items.map((list_dashboard_item, i) => (
							<NavButton
								key={i}
								active={list_dashboard_item.condition(
									dashboard_item
								)}
								onClick={() =>
									handleNav(list_dashboard_item.name)
								}
							>
								<FontAwesomeIcon
									icon={list_dashboard_item.icon}
								/>
							</NavButton>
						))}
					</>
				}
			/>
		</>
	);
};

export default Dashboard;
