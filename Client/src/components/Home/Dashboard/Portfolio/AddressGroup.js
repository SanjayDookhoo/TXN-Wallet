import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import covalentAPI from '../../../../ducks/api/covalent';
import Token from './Token';
import { createLoadingModal, removeLoadingModal } from '../../LoadingModal';
import { useSnackbar } from 'notistack';

const compare = (asc_order, field, a, b) => {
	// only string
	if (field === 'contract_ticker_symbol') {
		const new_a = a[field] ? a[field] : '';
		const new_b = b[field] ? b[field] : '';

		return asc_order
			? new_a.localeCompare(new_b)
			: new_b.localeCompare(new_a);
	} else {
		// rest is numbers
		const new_a = a[field] ? a[field] : 0;
		const new_b = b[field] ? b[field] : 0;

		return asc_order ? new_a - new_b : new_b - new_a;
	}
};

const AddressGroup = ({
	database,
	chain,
	address,
	tokens_map,
	token_filter,
	sort_criteria,
	asc_order,
	chart_obj_series,
	breadcrumb_view,
	...other_params
}) => {
	const { enqueueSnackbar } = useSnackbar();
	const [collapsed, updateCollapsed] = useState(false);
	const [historical_prices_map, updateHistoricalPricesMap] = useState({}); // contract-address => today / 1d => price
	const [tokens_w_prices, updateTokensWPrices] = useState([]);

	// get covalent data
	useEffect(async () => {
		const currency = 'usd';
		if (address && tokens_map && tokens_map[address.id]) {
			const contract_addresses = Object.keys(tokens_map[address.id]).join(
				','
			);
			const modal = createLoadingModal();
			try {
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
				data.data.forEach((token_prices) => {
					temp_historical_prices_map[token_prices.contract_address] =
						{
							today: token_prices?.prices?.[0]?.price,
							'1d': token_prices?.prices?.[1]?.price,
						};
				});

				updateHistoricalPricesMap(temp_historical_prices_map);
			} catch (error) {
				console.log({ error });
				enqueueSnackbar('Something went wrong', {
					variant: 'error',
				});
			} finally {
				removeLoadingModal(modal);
			}
		}
	}, [tokens_map, address]);

	useEffect(() => {
		const temp_tokens_w_prices = [];

		if (tokens_map[address.id]) {
			Object.values(tokens_map[address.id]).forEach((token) => {
				const { processed_balance } = token;
				const today =
					historical_prices_map[token.contract_address]?.['today'];
				const yesterday =
					historical_prices_map[token.contract_address]?.['1d'];

				let token_increased_percent = null;
				if (today != null && yesterday != null) {
					if (yesterday === 0) {
						token_increased_percent = null;
					} else {
						token_increased_percent =
							(100 * (today - yesterday)) / yesterday;
					}
				}
				let token_increased_value = null;
				if (today != null && yesterday != null) {
					token_increased_value = today - yesterday;
				}

				let dollar_increased_percent = null;
				if (today != null && yesterday != null) {
					const val_today = today * processed_balance;
					const val_yesterday = yesterday * processed_balance;
					if (val_yesterday === 0) {
						dollar_increased_percent = null;
					} else {
						dollar_increased_percent =
							(100 * (val_today - val_yesterday)) / val_yesterday;
					}
				}

				let dollar_increased_value = null;
				if (today != null && yesterday != null) {
					dollar_increased_value =
						today * processed_balance -
						yesterday * processed_balance;
				}

				const temp_token = {
					...token,
					token_price_today: today,
					tokens_price_today: today * processed_balance,
					token_increased_percent,
					token_increased_value,
					dollar_increased_percent,
					dollar_increased_value,
				};

				temp_tokens_w_prices.push(temp_token);
			});

			updateTokensWPrices(temp_tokens_w_prices);
		}
	}, [tokens_map, historical_prices_map]);

	const toggleCollapsible = () => {
		updateCollapsed(!collapsed);
	};

	const token_params = {
		chain,
		chart_obj_series,
		...other_params,
	};

	useEffect(() => {
		console.log({ tokens_w_prices });
	}, [tokens_w_prices]);

	return (
		<div className="address-group my-4 p-2 rounded-lg border-2 border-yellow-400 bg-gray-400">
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
				{tokens_w_prices
					.sort((a, b) => compare(asc_order, sort_criteria, a, b))
					.filter(
						(token) =>
							token.contract_name
								.toLowerCase()
								.includes(token_filter.toLowerCase()) ||
							token.contract_ticker_symbol
								.toLowerCase()
								.includes(token_filter.toLowerCase())
					)
					.filter(
						(token) =>
							breadcrumb_view === 'home' ||
							(breadcrumb_view === 'chart' &&
								chart_obj_series
									.map(
										(one_series) =>
											one_series.contract_address
									)
									.includes(token.contract_address))
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

export default AddressGroup;
