import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faSortUp,
	faSortDown,
	faSort,
	faRecycle,
	faChartLine,
	faHome,
} from '@fortawesome/free-solid-svg-icons';
import { useSnackbar } from 'notistack';
import {
	databaseGet,
	databasePost,
	databaseDelete,
	databasePatch,
} from '../../../../ducks/actions/database';
import ContentHeading from '../ContentHeading';
import ContentBody from '../ContentBody';
import Input from '../../../Input';
import covalentAPI from '../../../../ducks/api/covalent';
import coin_fallback from '../../../../assets/coin_fallback.png';
import { createChart, PriceScaleMode } from 'lightweight-charts';
import {
	token_col,
	token_data,
	token_data_group,
	token_data_layout,
} from './utils.js';
import BlockchainAddressGroup from './BlockchainAddressGroup';
import { adjustDecimalPoint } from '../utils';
import { Breadcrumbs, Fab } from '@material-ui/core';
import { useHistory } from 'react-router';
import { createLoadingModal, removeLoadingModal } from '../../LoadingModal';
import { useLocation } from 'react-router-dom';
import Button from '../../../Button';

const Portfolio = ({ chains, updateChartTouchstart }) => {
	const dispatch = useDispatch();
	const history = useHistory();
	const location = useLocation();
	const app = useSelector((state) => state.app);
	const { enqueueSnackbar } = useSnackbar();

	const database = useSelector((state) => state.database);
	const [user, updateUser] = useState(
		JSON.parse(localStorage.getItem('profile'))
	);
	const [chains_map, updateChainsMap] = useState({});
	const [show_graphs, updateShowGraphs] = useState(true);
	const [token_filter, updateTokenFilter] = useState('');
	const [tokens_map, updateTokensMap] = useState({}); // maps address to tokens
	const chart_ref = useRef(null);
	const [chart_obj, updateChartObj] = useState(null);
	const [chart_obj_series, updateChartObjSeries] = useState([]);
	const [sort_criteria, updateSortCriteria] = useState(
		'contract_ticker_symbol'
	);
	const [asc_order, updateAscOrder] = useState(true);
	const [breadcrumb_view, updateBreadcrumbView] = useState('home');
	const [date_range_limiting, updateDateRangeLimiting] = useState('1y');

	useEffect(() => {
		if (database.chain) {
			const temp_chains_map = Object.fromEntries(
				chains.map((chain) => [chain.chain_id, chain])
			);
			updateChainsMap(temp_chains_map);
		}
	}, [chains, database]);

	// get covalent data
	useEffect(async () => {
		if (database.address) {
			const promises = Object.values(database.address).map((address) => {
				return covalentAPI.get(
					`/${
						database.chain[address.chain_id].covalent_chain_id
					}/address/${address.address_hash}/balances_v2/`,
					{
						params: {},
					}
				);
			});

			const modal = createLoadingModal();
			try {
				const promises_res = await Promise.all(promises);

				const address_arr = Object.values(database.address);
				let temp_tokens_map = {};
				promises_res.forEach((promise, i) => {
					if (!temp_tokens_map[address_arr[i].id]) {
						temp_tokens_map[address_arr[i].id] = {};
					}
					const promise_res = promise.data.data.items;
					const token_map = Object.fromEntries(
						promise_res.map((promise_token) => {
							let { balance, contract_decimals } = promise_token;
							const processed_balance = adjustDecimalPoint(
								balance,
								contract_decimals
							);

							return [
								promise_token.contract_address,
								{
									...promise_token,
									processed_balance,
								},
							];
						})
					);
					temp_tokens_map[address_arr[i].id] = {
						...temp_tokens_map[address_arr[i].id],
						...token_map,
					};
				});

				updateTokensMap(temp_tokens_map);
			} catch (error) {
				console.log({ error });
				enqueueSnackbar('Something went wrong', {
					variant: 'error',
				});
			} finally {
				removeLoadingModal(modal);
			}
		}
	}, [database]);

	useEffect(() => {
		const modal = createLoadingModal();
		dispatch(
			databaseGet({
				table_name: 'chain',
				req_params: {
					created_by_user: user?.result?.id,
				},
				onFailure: (error) => {
					console.log({ error });
					enqueueSnackbar('Something went wrong', {
						variant: 'error',
					});
				},
				onFinish: () => {
					removeLoadingModal(modal);
				},
			})
		);
	}, [user]);

	const blockchain_address_group_params = {
		database,
		chains,
		chains_map,
		tokens_map,
		token_filter,
		chart_obj,
		chart_obj_series,
		sort_criteria,
		asc_order,
		breadcrumb_view,
		updateChartObjSeries,
	};

	useEffect(() => {
		if (chart_ref && chart_ref.current) {
			let width = window.innerWidth;
			if (width < 1020) {
				width = width - 40;
			} else {
				width = width - 250;
			}

			const chart = createChart(chart_ref.current, {
				width,
				height: 300,
				rightPriceScale: {
					mode: PriceScaleMode.Normal,
					autoScale: true,
					invertScale: false,
					alignLabels: true,
					borderVisible: true,
					scaleMargins: { top: 0.25, bottom: 0.25 },
				},
				localization: {
					priceFormatter: (price) => '$' + price,
				},
			});
			updateChartObj(chart);

			chart_obj_series.forEach((one_series) => {
				const { color, prices } = one_series;
				var lineSeries = chart.addLineSeries({
					color,
				});
				const new_prices = handleDateRangeLimiting(
					date_range_limiting,
					prices
				);
				lineSeries.setData(new_prices);
			});
			chart.timeScale().fitContent();

			// used to stop propagation of touch gestures, due to the way this charting library handles touch, stopPropagation cant be used without breaking both
			const handleTouchstart = (e) => {
				updateChartTouchstart(e.changedTouches[0].screenX);
			};
			chart_ref.current.addEventListener('touchstart', handleTouchstart);

			return () => chart.remove();
		}
	}, [chart_ref, chart_obj_series, date_range_limiting]);

	useEffect(() => {
		if (chart_obj) {
			const handleResize = () => {
				let width = window.innerWidth;
				if (width < 1020) {
					width = width - 40;
				} else {
					width = width - 250;
				}
				chart_obj.applyOptions({ width });
			};

			window.addEventListener('resize', handleResize);

			return () => {
				window.removeEventListener('resize', handleResize);
			};
		}
	}, [chart_obj]);

	const toggleSort = (toggle_criteria) => {
		if (sort_criteria === toggle_criteria) {
			updateAscOrder(!asc_order);
		} else {
			if (toggle_criteria === 'contract_ticker_symbol') {
				// only string value starts at ascending order
				updateAscOrder(true);
			} else {
				// any other value starts at descending order
				updateAscOrder(false);
			}
			updateSortCriteria(toggle_criteria);
		}
	};

	const sortIconRender = (toggle_criteria) => {
		if (sort_criteria !== toggle_criteria) {
			return <FontAwesomeIcon icon={faSort} />;
		} else {
			if (asc_order) {
				return <FontAwesomeIcon icon={faSortUp} />;
			} else {
				return <FontAwesomeIcon icon={faSortDown} />;
			}
		}
	};

	const changeBreadcrumbView = (new_breadcrumb_view) => {
		let pathname = location.pathname;

		if (pathname === '/' && new_breadcrumb_view === 'chart') {
			history.push('/chart');
		}

		if (pathname === '/chart' && new_breadcrumb_view === 'home') {
			history.goBack();
		}
	};

	useEffect(() => {
		let pathname = location.pathname;

		if (pathname === '/') {
			updateBreadcrumbView('home');
		}

		if (pathname === '/chart') {
			updateBreadcrumbView('chart');
		}
	}, [location]);

	const handleDateRangeLimiting = (range, prices) => {
		const to = new Date();

		const _helper = (months) => {
			let from = new Date();
			from.setMonth(from.getMonth() - months);

			const filtered = prices.filter((price) => {
				// console.log(price);
				let price_date;
				if (typeof price.time === 'string') {
					price_date = new Date(price.time);
				} else {
					const { year, month, day } = price.time;
					price_date = new Date(`${year}-${month}-${day}`);
				}

				return (
					price_date.getTime() >= from.getTime() &&
					price_date.getTime() <= to.getTime()
				);
			});

			return [...filtered];
		};

		switch (range) {
			case '1m':
				return _helper(1);
			case '3m':
				return _helper(3);
			case '6m':
				return _helper(6);
			case '9m':
				return _helper(9);
			case '1y':
				return _helper(12);
			default:
				return prices;
		}
	};

	// useEffect(() => {
	// 	console.log({ date_range_limiting });
	// }, [date_range_limiting]);

	return (
		<>
			<ContentHeading>Portfolio</ContentHeading>
			<ContentBody>
				<Breadcrumbs aria-label="breadcrumb">
					<div
						className="waves-effect cursor-pointer"
						onClick={() => changeBreadcrumbView('home')}
					>
						<FontAwesomeIcon icon={faHome} /> home
					</div>
					{breadcrumb_view === 'chart' && (
						<div
							className="waves-effect cursor-pointer"
							onClick={() => changeBreadcrumbView('chart')}
						>
							<FontAwesomeIcon icon={faChartLine} /> Chart
						</div>
					)}
				</Breadcrumbs>

				<div
					className={`pt-4 ${
						breadcrumb_view !== 'chart' ? 'hidden' : ''
					}`}
				>
					<div ref={chart_ref}></div>
					<div className="flex justify-around items-center">
						<Button
							variant={
								date_range_limiting === '1m'
									? 'secondary'
									: 'light'
							}
							onClick={() => updateDateRangeLimiting('1m')}
						>
							1M
						</Button>
						<Button
							variant={
								date_range_limiting === '3m'
									? 'secondary'
									: 'light'
							}
							onClick={() => updateDateRangeLimiting('3m')}
						>
							3M
						</Button>
						<Button
							variant={
								date_range_limiting === '6m'
									? 'secondary'
									: 'light'
							}
							onClick={() => updateDateRangeLimiting('6m')}
						>
							6M
						</Button>
						<Button
							variant={
								date_range_limiting === '9m'
									? 'secondary'
									: 'light'
							}
							onClick={() => updateDateRangeLimiting('9m')}
						>
							9M
						</Button>
						<Button
							variant={
								date_range_limiting === '1y'
									? 'secondary'
									: 'light'
							}
							onClick={() => updateDateRangeLimiting('1y')}
						>
							1Y
						</Button>
					</div>
				</div>
				<Input
					name="filter"
					label="Filter"
					value={token_filter}
					handleChange={(e) => updateTokenFilter(e.target.value)}
					type="text"
				/>
				<div
					className={`${breadcrumb_view !== 'home' ? 'hidden' : ''}`}
				>
					<div className="text-center text-gray-500">
						Layout Understanding and Sorting
					</div>
					<div
						className={`token flex justify-start items-center my-4 p-2 rounded-lg border-2 border-yellow-400 bg-gray-400 text-xs lg:text-base`}
					>
						<div className="token-logo hidden lg:block">
							<img className="h-10" src={coin_fallback} />
						</div>
						<div className={`${token_col}`}>
							<div
								className={`${token_data_layout} ${
									app.is_mobile_app
										? ''
										: 'hover:bg-yellow-200'
								}`}
								onClick={() =>
									toggleSort('contract_ticker_symbol')
								}
							>
								{sortIconRender('contract_ticker_symbol')}{' '}
								&nbsp; Token
							</div>
							<div
								className={`${token_data_layout} ${
									app.is_mobile_app
										? ''
										: 'hover:bg-yellow-200'
								}`}
								onClick={() => toggleSort('processed_balance')}
							>
								{sortIconRender('processed_balance')} &nbsp; Qty
							</div>
						</div>
						<div className={`${token_col}`}>
							<div
								className={`${token_data_layout} ${
									app.is_mobile_app
										? ''
										: 'hover:bg-yellow-200'
								}`}
								onClick={() => toggleSort('token_price_today')}
							>
								{' '}
								{sortIconRender('token_price_today')} &nbsp;
								Value/1
							</div>

							<div className={`${token_data_group}`}>
								<div
									className={`${token_data_layout} ${
										app.is_mobile_app
											? ''
											: 'hover:bg-yellow-200'
									}`}
									onClick={() =>
										toggleSort('token_increased_value')
									}
								>
									{sortIconRender('token_increased_value')}{' '}
									&nbsp; <FontAwesomeIcon icon={faRecycle} />
								</div>
								<div
									className={`${token_data_layout} ${
										app.is_mobile_app
											? ''
											: 'hover:bg-yellow-200'
									}`}
									onClick={() =>
										toggleSort('token_increased_percent')
									}
								>
									{sortIconRender('token_increased_percent')}{' '}
									&nbsp; <FontAwesomeIcon icon={faRecycle} />{' '}
									&nbsp; %
								</div>
							</div>
						</div>
						<div className={`${token_col}`}>
							<div
								className={`${token_data_layout} ${
									app.is_mobile_app
										? ''
										: 'hover:bg-yellow-200'
								}`}
								onClick={() => toggleSort('tokens_price_today')}
							>
								{sortIconRender('tokens_price_today')} &nbsp;
								Value/all
							</div>
							<div className={`${token_data_group}`}>
								<div
									className={`${token_data_layout} ${
										app.is_mobile_app
											? ''
											: 'hover:bg-yellow-200'
									}`}
									onClick={() =>
										toggleSort('dollar_increased_value')
									}
								>
									{sortIconRender('dollar_increased_value')}{' '}
									&nbsp; <FontAwesomeIcon icon={faRecycle} />
								</div>
								<div
									className={`${token_data_layout} ${
										app.is_mobile_app
											? ''
											: 'hover:bg-yellow-200'
									}`}
									onClick={() =>
										toggleSort('token_increased_percent')
									}
								>
									{sortIconRender('token_increased_percent')}{' '}
									&nbsp; <FontAwesomeIcon icon={faRecycle} />{' '}
									&nbsp; %
								</div>
							</div>
						</div>
					</div>
					<div
						className="absolute top-16 right-16"
						style={{ zIndex: 2000 }}
					>
						<Fab
							color="secondary"
							aria-label="add"
							onClick={() => changeBreadcrumbView('chart')}
							disabled={chart_obj_series.length === 0}
						>
							<FontAwesomeIcon icon={faChartLine} />
						</Fab>
					</div>
				</div>
				<div className="">
					{database.chain &&
						Object.values(database.chain)
							.sort((a, b) =>
								chains_map[a.covalent_chain_id]?.label
									.toString()
									.localeCompare(
										chains_map[
											b.covalent_chain_id
										]?.label.toString()
									)
							)
							.map((chain) => (
								<BlockchainAddressGroup
									key={chain.id}
									chain={chain}
									{...blockchain_address_group_params}
								/>
							))}
				</div>
			</ContentBody>
		</>
	);
};

export default Portfolio;
