import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faTrash,
	faEdit,
	faPlus,
	faMinus,
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
import Button from '../../../Button';
import Input from '../../../Input';
import covalentAPI from '../../../../ducks/api/covalent';
import coin_fallback from '../../../../assets/coin_fallback.png';
import { createChart } from 'lightweight-charts';

const chart_color_arr = ['#ff8a65', '#4fc3f7', '#9575cd', '#ba68c8', '#e57373'];

const Portfolio = ({ chains, updateChartTouchstart }) => {
	const dispatch = useDispatch();

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

	useEffect(() => {
		console.log({ tokens_map });
	}, [tokens_map]);

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
					promise_res.map((promise_token) => [
						promise_token.contract_address,
						promise_token,
					])
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

	const handleShowGraphsToggle = () => {
		updateShowGraphs(!show_graphs);
	};

	const blockchain_address_group_params = {
		database,
		chains,
		chains_map,
		tokens_map,
		token_filter,
		chart_obj,
		chart_obj_series,
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

	return (
		<>
			<ContentHeading>Portfolio</ContentHeading>
			<ContentBody>
				<div
					className={`${
						chart_obj_series.length === 0 ? 'hidden' : ''
					}`}
					ref={chart_ref}
				></div>
				<Input
					name="filter"
					label="Filter"
					value={token_filter}
					handleChange={(e) => updateTokenFilter(e.target.value)}
					type="text"
				/>
				{/* <Button onClick={handleShowGraphsToggle}>
					{show_graphs ? 'Show' : 'Hide'} Graphs
				</Button> */}
				<div className="">
					{database.chain &&
						Object.values(database.chain).map((chain) => (
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

const BlockchainAddressGroup = ({
	database,
	chains,
	chains_map,
	chain,
	...other_params
}) => {
	const [collapsed, updateCollapsed] = useState(false);

	const toggleCollapsible = () => {
		updateCollapsed(!collapsed);
	};

	const address_group_params = {
		database,
		chain,
		...other_params,
	};

	return (
		<div className="blockchain-address-group my-4 p-2 bg-green-300">
			<div
				className="blockchain-address-group-header flex justify-between items-center h-12 group cursor-pointer"
				onClick={toggleCollapsible}
			>
				<div className="blockchain-icon">
					<img
						className="h-10"
						src={chains_map[chain.covalent_chain_id]?.logo_url}
						onError={(e) => {
							e.target.onerror = null;
							e.target.src = coin_fallback;
						}}
					/>
				</div>
				<div className="blockchain-name cursor-pointer rounded-lg p-2 group-hover:text-lg">
					{collapsed ? (
						<FontAwesomeIcon icon={faPlus} />
					) : (
						<FontAwesomeIcon icon={faMinus} />
					)}
					<div className="inline pl-2">
						{chains_map[chain.covalent_chain_id]?.label}
					</div>
				</div>
				<div></div>
			</div>
			<div className={`${collapsed && 'hidden'}`}>
				{database.address &&
					Object.values(database.address)
						.filter((address) => address.chain_id === chain.id)
						.map((address) => (
							<AddressGroup
								key={address.id}
								address={address}
								{...address_group_params}
							/>
						))}
			</div>
		</div>
	);
};

const AddressGroup = ({
	database,
	chain,
	address,
	tokens_map,
	token_filter,
	...other_params
}) => {
	const [collapsed, updateCollapsed] = useState(false);
	const [historical_prices_map, updateHistoricalPricesMap] = useState({}); // contract-address => today / 1d => price

	// get covalent data
	useEffect(async () => {
		const currency = 'usd';
		if (address && tokens_map && tokens_map[address.id]) {
			const contract_addresses = Object.keys(tokens_map[address.id]).join(
				','
			);
			console.log({ contract_addresses });

			const { data, status } = await covalentAPI.get(
				`/pricing/historical_by_addresses_v2/${chain.covalent_chain_id}/${currency}/${contract_addresses}/`,
				{
					params: {
						to: new Date().toISOString().split('T')[0],
						from: new Date(Date.now() - 86400000) // yesterday
							.toISOString()
							.split('T')[0],
					},
				}
			);

			const temp_historical_prices_map = {};
			console.log(temp_historical_prices_map);
			data.data.forEach((token_prices) => {
				temp_historical_prices_map[token_prices.contract_address] = {
					today: token_prices?.prices?.[0]?.price,
					'1d': token_prices?.prices?.[1]?.price,
				};
			});

			console.log({ temp_historical_prices_map });
			updateHistoricalPricesMap(temp_historical_prices_map);
		}
	}, [tokens_map, address]);

	const toggleCollapsible = () => {
		updateCollapsed(!collapsed);
	};

	const token_params = {
		historical_prices_map,
		chain,
		...other_params,
	};

	return (
		<div className="address-group my-4 p-2 bg-green-500">
			<div
				className="address-group-header flex justify-between items-center h-12 group cursor-pointer"
				onClick={toggleCollapsible}
			>
				<div className=""></div>
				<div className="address-name cursor-pointer rounded-lg p-2 group-hover:text-lg">
					{collapsed ? (
						<FontAwesomeIcon icon={faPlus} />
					) : (
						<FontAwesomeIcon icon={faMinus} />
					)}
					<div className="inline pl-2">{address?.name}</div>
				</div>
				<div></div>
			</div>
			<div className={`p-2 ${collapsed && 'hidden'}`}>
				{tokens_map &&
					tokens_map[address.id] &&
					Object.values(tokens_map[address.id])
						.filter(
							(token) =>
								token.contract_name
									.toLowerCase()
									.includes(token_filter.toLowerCase()) ||
								token.contract_ticker_symbol
									.toLowerCase()
									.includes(token_filter.toLowerCase())
						)
						.map((token) => (
							<Token
								key={token.contract_address}
								token={token}
								{...token_params}
							/>
						))}
			</div>
		</div>
	);
};

const Token = ({
	token,
	historical_prices_map,
	chain,
	chart_obj,
	chart_obj_series,
	updateChartObjSeries,
}) => {
	const { enqueueSnackbar } = useSnackbar();
	const [token_increased_percent, updateTokenIncreasedPercent] =
		useState(null);
	const [token_increased_value, updateTokenIncreasedValue] = useState(null);
	const [dollar_increased_percent, updateDollarIncreasedPercent] =
		useState(null);
	const [dollar_increased_value, updateDollarIncreasedValue] = useState(null);

	const token_col =
		'token-col flex flex-col justify-center items-start flex-basis-0 flex-grow';
	const token_data = 'token-data p-2 h-8 overflow-hidden';

	useEffect(() => {
		console.log({ token });
	}, [token]);

	const valueLengthPreProcessing = (value) => {
		if (value == null) return '';

		const max_val = 999999;
		const to_fixed = 2;

		const post_fix_arr = [
			{
				modifier: 1,
				post_fix: '',
			},
			{
				modifier: 1000,
				post_fix: 'K',
			},
			{
				modifier: 1000000,
				post_fix: 'M',
			},
			{
				modifier: 1000000000,
				post_fix: 'B',
			},
			{
				modifier: 1000000000000,
				post_fix: 'T',
			},
			{
				modifier: 1000000000000000,
				post_fix: 'Qa',
			},
			{
				modifier: 1000000000000000000,
				post_fix: 'Qu',
			},
			{
				modifier: 1000000000000000000000,
				post_fix: 'S',
			},
		];

		for (let i = 0; i < post_fix_arr.length; i++) {
			const post_fix = post_fix_arr[i];

			const new_value = value / post_fix.modifier;
			if (Math.abs(new_value) <= max_val) {
				return `${new_value.toLocaleString(undefined, {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				})} ${post_fix.post_fix}`;
			}
		}

		return `LARGE`;
	};

	useEffect(() => {
		const today = historical_prices_map[token.contract_address]?.['today'];
		const yesterday = historical_prices_map[token.contract_address]?.['1d'];

		let temp_token_increased_percent = null;
		if (today != null && yesterday != null) {
			if (yesterday === 0) {
				temp_token_increased_percent = null;
			} else {
				temp_token_increased_percent =
					(100 * (today - yesterday)) / yesterday;
			}
		}
		updateTokenIncreasedPercent(temp_token_increased_percent);

		let temp_token_increased_value = null;
		if (today != null && yesterday != null) {
			temp_token_increased_value = today - yesterday;
		}
		updateTokenIncreasedValue(temp_token_increased_value);

		let temp_dollar_increased_percent = null;
		if (today != null && yesterday != null) {
			const val_today = today * token.balance;
			const val_yesterday = yesterday * token.balance;
			if (val_yesterday === 0) {
				temp_dollar_increased_percent = null;
			} else {
				temp_dollar_increased_percent =
					(100 * (val_today - val_yesterday)) / val_yesterday;
			}
		}
		updateDollarIncreasedPercent(temp_dollar_increased_percent);

		let temp_dollar_increased_value = null;
		if (today != null && yesterday != null) {
			temp_dollar_increased_value =
				today * token.balance - yesterday * token.balance;
		}
		updateDollarIncreasedValue(temp_dollar_increased_value);
	}, [token, historical_prices_map]);

	const toggleSeriesInChart = async () => {
		console.log({ token });
		let found_in_series = chart_obj_series.findIndex(
			(one_series) =>
				one_series.contract_address === token.contract_address
		);

		if (found_in_series === -1) {
			const currency = 'usd';
			const to = new Date();
			const from = new Date();
			from.setMonth(from.getMonth() - 12);
			try {
				const { data, status } = await covalentAPI.get(
					`/pricing/historical_by_addresses_v2/${chain.covalent_chain_id}/${currency}/${token.contract_address}/`,
					{
						params: {
							to: to.toISOString().split('T')[0],
							from: from.toISOString().split('T')[0],
						},
					}
				);

				console.log({ data });
				const prices = data.data[0].prices
					.filter(
						(price) => price.date != null || price.price != null
					)
					.map((price) => ({
						time: price.date,
						value: price.price.toFixed(0),
					}));
				const avail_color = chart_color_arr.find(
					(color) =>
						!chart_obj_series
							.map((one_series) => one_series.color)
							.includes(color)
				);

				if (avail_color) {
					!chart_obj_series
						.map((one_series) => one_series.color)
						.includes(avail_color);

					const new_series = chart_obj.addAreaSeries({
						topColor: `${avail_color}00`,
						bottomColor: `${avail_color}00`,
						lineColor: `${avail_color}`,
						lineWidth: 2,
					});

					console.log({ prices });
					console.log({ avail_color });
					console.log(token.contract_address);

					new_series.setData(prices);

					updateChartObjSeries([
						...chart_obj_series,
						{
							contract_address: token.contract_address,
							color: avail_color,
							series: new_series,
						},
					]);

					chart_obj.timeScale().fitContent();
				} else {
					enqueueSnackbar(
						`Can only add ${chart_color_arr.length} tokens in chart`,
						{
							variant: 'error',
						}
					);
				}
			} catch (error) {
				enqueueSnackbar(`Something went wrong`, {
					variant: 'error',
				});
			}
		} else {
			chart_obj.removeSeries(chart_obj_series[found_in_series].series);
			updateChartObjSeries(
				chart_obj_series.filter(
					(one_series) =>
						one_series.contract_address !==
						chart_obj_series[found_in_series].contract_address
				)
			);
		}
	};

	const backgroundColorOnClick = () => {
		const found = chart_obj_series.findIndex(
			(one_series) =>
				one_series.contract_address === token.contract_address
		);

		if (found !== -1) {
			return chart_obj_series[found].color;
		} else {
			return '';
		}
	};

	return (
		<div
			className={`token flex justify-start items-center border-t-2 border-yellow-200 waves-effect cursor-pointer`}
			style={{
				backgroundColor: backgroundColorOnClick(),
			}}
			onClick={toggleSeriesInChart}
		>
			<div className="token-logo">
				<img
					className="h-10"
					src={token.logo_url}
					onError={(e) => {
						e.target.onerror = null;
						e.target.src = coin_fallback;
					}}
				/>
			</div>
			<div className={`${token_col}`}>
				<div className={`${token_data}`}>
					{token.contract_ticker_symbol}
				</div>
				<div className={`${token_data}`}>
					{valueLengthPreProcessing(token.balance)}
				</div>
			</div>
			<div className={`${token_col}`}>
				<div className={`${token_data}`}>
					{valueLengthPreProcessing(
						historical_prices_map[token.contract_address]?.['today']
					)}
				</div>
				<div
					className={`${token_data} ${
						token_increased_percent > 0 && 'text-green-800'
					} ${token_increased_percent < 0 && 'text-red-800'}`}
				>
					{valueLengthPreProcessing(token_increased_value)}
					{token_increased_percent &&
						'(' +
							valueLengthPreProcessing(token_increased_percent) +
							'%)'}
				</div>
			</div>
			<div className={`${token_col}`}>
				<div className={`${token_data}`}>
					{valueLengthPreProcessing(
						historical_prices_map[token.contract_address]?.[
							'today'
						] * token.balance
					)}
				</div>
				<div
					className={`${token_data} ${
						dollar_increased_percent > 0 && 'text-green-800'
					} ${dollar_increased_percent < 0 && 'text-red-800'}`}
				>
					{valueLengthPreProcessing(dollar_increased_value)}
					{dollar_increased_percent &&
						'(' +
							valueLengthPreProcessing(dollar_increased_percent) +
							'%)'}
				</div>
			</div>
		</div>
	);
};
