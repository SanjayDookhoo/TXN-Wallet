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
import { createChart } from 'lightweight-charts';
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

const Portfolio = ({ chains, updateChartTouchstart }) => {
	const dispatch = useDispatch();
	const history = useHistory();

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

	// useEffect(() => {
	// 	console.log({ tokens_map });
	// }, [tokens_map]);

	useEffect(() => {
		console.log({ database });
	}, [database]);

	useEffect(() => {
		console.log({ user });
	}, [user]);

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
		}
	}, [database]);

	useEffect(() => {
		dispatch(
			databaseGet({
				table_name: 'chain',
				req_params: {
					created_by_user: user?.result?.id,
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
		updateChartObjSeries,
	};

	useEffect(() => {
		if (chart_ref && chart_ref.current) {
			let width = window.innerWidth;
			if (width < 780) {
				width = 350;
			} else {
				width = width - 260;
			}

			const chart = createChart(chart_ref.current, {
				width,
				height: 300,
				rightPriceScale: {
					scaleMargins: {
						top: 0.1,
						bottom: 0.1,
					},
					autoScale: true,
				},
			});
			updateChartObj(chart);

			// used to stop propagation of touch gestures, due to the way this charting library handles touch, stopPropagation cant be used without breaking both
			const handleTouchstart = (e) => {
				updateChartTouchstart(e.changedTouches[0].screenX);
			};
			chart_ref.current.addEventListener('touchstart', handleTouchstart);
			// return () => {
			// 	chart_ref.current.removeEventListener(
			// 		'touchstart',
			// 		handleTouchstart
			// 	);
			// };
		}
	}, [chart_ref]);

	useEffect(() => {
		if (chart_obj) {
			const handleResize = () => {
				let width = window.innerWidth;
				if (width < 780) {
					width = 350;
				} else {
					width = width - 260;
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
		let pathname = window.location.pathname;
		pathname =
			pathname.slice(-1) === '/'
				? pathname.slice(0, pathname.length - 1)
				: pathname;

		if (
			(pathname === '' || pathname === '/active') &&
			new_breadcrumb_view === 'chart'
		) {
			console.log('test');
			history.push(pathname + '/chart');
		}

		if (
			(pathname === '/chart' || pathname === '/active/chart') &&
			new_breadcrumb_view === 'home'
		) {
			history.goBack();
		}
	};

	useEffect(() => {
		let pathname = window.location.pathname;
		pathname =
			pathname.slice(-1) === '/'
				? pathname.slice(0, pathname.length - 1)
				: pathname;

		if (pathname === '' || pathname === '/active') {
			updateBreadcrumbView('home');
		}

		if (pathname === '/chart' || pathname === '/active/chart') {
			updateBreadcrumbView('chart');
		}
	}, [window.location.pathname]);

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
					className={`${breadcrumb_view !== 'home' ? 'hidden' : ''}`}
				>
					<Input
						name="filter"
						label="Filter"
						value={token_filter}
						handleChange={(e) => updateTokenFilter(e.target.value)}
						type="text"
					/>
					<div className="text-center text-gray-500">
						Layout Understanding and Sorting
					</div>
					<div className="bg-green-600">
						<div
							className={`token flex justify-start items-center border-t-2 border-yellow-200`}
						>
							<div className="token-logo">
								<img className="h-10" src={coin_fallback} />
							</div>
							<div className={`${token_col}`}>
								<div
									className={`${token_data_layout}`}
									onClick={() =>
										toggleSort('contract_ticker_symbol')
									}
								>
									{sortIconRender('contract_ticker_symbol')}{' '}
									&nbsp; Coin Name
								</div>
								<div
									className={`${token_data_layout}`}
									onClick={() =>
										toggleSort('processed_balance')
									}
								>
									{sortIconRender('processed_balance')} &nbsp;
									Qty of Coins
								</div>
							</div>
							<div className={`${token_col}`}>
								<div
									className={`${token_data_layout}`}
									onClick={() =>
										toggleSort('token_price_today')
									}
								>
									{' '}
									{sortIconRender('token_price_today')} &nbsp;
									One Coin Value
								</div>

								<div className={`${token_data_group}`}>
									<div
										className={`${token_data_layout} w-1/2`}
										onClick={() =>
											toggleSort('token_increased_value')
										}
									>
										{sortIconRender(
											'token_increased_value'
										)}{' '}
										&nbsp; 24h &nbsp;{' '}
										<FontAwesomeIcon icon={faRecycle} />
									</div>
									<div
										className={`${token_data_layout} w-1/2`}
										onClick={() =>
											toggleSort(
												'token_increased_percent'
											)
										}
									>
										{sortIconRender(
											'token_increased_percent'
										)}{' '}
										&nbsp; 24h &nbsp;{' '}
										<FontAwesomeIcon icon={faRecycle} />{' '}
										&nbsp; %
									</div>
								</div>
							</div>
							<div className={`${token_col}`}>
								<div
									className={`${token_data_layout}`}
									onClick={() =>
										toggleSort('tokens_price_today')
									}
								>
									{sortIconRender('tokens_price_today')}{' '}
									&nbsp; Coin Values
								</div>
								<div className={`${token_data_group}`}>
									<div
										className={`${token_data_layout} w-1/2`}
										onClick={() =>
											toggleSort('dollar_increased_value')
										}
									>
										{sortIconRender(
											'dollar_increased_value'
										)}{' '}
										&nbsp; 24h &nbsp;{' '}
										<FontAwesomeIcon icon={faRecycle} />
									</div>
									<div
										className={`${token_data_layout} w-1/2`}
										onClick={() =>
											toggleSort(
												'token_increased_percent'
											)
										}
									>
										{sortIconRender(
											'token_increased_percent'
										)}{' '}
										&nbsp; 24h &nbsp;{' '}
										<FontAwesomeIcon icon={faRecycle} />{' '}
										&nbsp; %
									</div>
								</div>
							</div>
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
					<div className="absolute bottom-10 right-10">
						<Fab
							color="primary"
							aria-label="add"
							onClick={() => changeBreadcrumbView('chart')}
							disabled={chart_obj_series.length === 0}
						>
							<FontAwesomeIcon icon={faChartLine} />
						</Fab>
					</div>
				</div>
				<div
					className={`${breadcrumb_view !== 'chart' ? 'hidden' : ''}`}
					ref={chart_ref}
				></div>
			</ContentBody>
		</>
	);
};

export default Portfolio;
