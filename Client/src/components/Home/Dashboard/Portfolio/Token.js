import React, { useEffect, useRef, useState } from 'react';
import { useSnackbar } from 'notistack';
import covalentAPI from '../../../../ducks/api/covalent';
import coin_fallback from '../../../../assets/coin_fallback.png';
import {
	token_col,
	token_data,
	token_data_group,
	token_data_layout,
} from './utils.js';
import { valueLengthPreProcessing } from '../utils';
import { createLoadingModal, removeLoadingModal } from '../../LoadingModal';
import { useSelector } from 'react-redux';

const chart_color_arr = ['#ff8a65', '#4fc3f7', '#9575cd', '#ba68c8', '#e57373'];

const Token = ({
	breadcrumb_view,
	token,
	chain,
	chart_obj,
	chart_obj_series,
	updateChartObjSeries,
}) => {
	const {
		contract_address,
		logo_url,
		contract_ticker_symbol,
		processed_balance,
		token_price_today,
		tokens_price_today,
		token_increased_percent,
		token_increased_value,
		dollar_increased_percent,
		dollar_increased_value,
	} = token;
	const { enqueueSnackbar } = useSnackbar();
	const app = useSelector((state) => state.app);

	const toggleSeriesInChart = async () => {
		let found_in_series = chart_obj_series.findIndex(
			(one_series) => one_series.contract_address === contract_address
		);

		if (found_in_series === -1) {
			const currency = 'usd';
			const to = new Date();
			const from = new Date();
			from.setMonth(from.getMonth() - 12);

			const modal = createLoadingModal();
			try {
				const { data, status } = await covalentAPI.get(
					`/pricing/historical_by_addresses_v2/${chain.covalent_chain_id}/${currency}/${contract_address}/`,
					{
						params: {
							to: to.toISOString().split('T')[0],
							from: from.toISOString().split('T')[0],
						},
					}
				);

				const prices = data.data[0].prices
					.filter(
						(price) => price.date != null || price.price != null
					)
					.map((price) => ({
						time: price.date,
						value:
							Math.round((price.price + Number.EPSILON) * 100) /
							100,
					}))
					.reverse();
				const avail_color = chart_color_arr.find(
					(color) =>
						!chart_obj_series
							.map((one_series) => one_series.color)
							.includes(color)
				);

				if (avail_color) {
					updateChartObjSeries([
						...chart_obj_series,
						{
							contract_address,
							color: avail_color,
							prices,
						},
					]);
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
			} finally {
				removeLoadingModal(modal);
			}
		} else {
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
			(one_series) => one_series.contract_address === contract_address
		);

		if (found !== -1) {
			return chart_obj_series[found].color;
		} else {
			return '';
		}
	};

	const prependPlus = (val) => {
		if (val > 0) {
			return '+';
		} else {
			return '';
		}
	};

	return (
		<div
			className={`token flex justify-start items-center m-1 p-1 ${
				app.is_mobile_app ? '' : 'hover:bg-yellow-200'
			} rounded-lg border-2 border-yellow-200 waves-effect cursor-pointer text-xs lg:text-base ${
				breadcrumb_view === 'chart' ? 'pointer-events-none' : ''
			}`}
			style={{
				backgroundColor: backgroundColorOnClick(),
			}}
			onClick={toggleSeriesInChart}
		>
			<div className="token-logo hidden lg:block">
				<img
					className="h-10"
					src={logo_url}
					onError={(e) => {
						e.target.onerror = null;
						e.target.src = coin_fallback;
					}}
				/>
			</div>
			<div className={`${token_col}`}>
				<div className={`${token_data}`}>{contract_ticker_symbol}</div>
				<div className={`${token_data}`}>
					{valueLengthPreProcessing(processed_balance)}
				</div>
			</div>
			<div className={`${token_col}`}>
				<div className={`${token_data}`}>
					{valueLengthPreProcessing(token_price_today)}
				</div>
				<div
					className={`${token_data} ${
						token_increased_percent > 0 && 'text-green-800'
					} ${token_increased_percent < 0 && 'text-red-800'}`}
				>
					{prependPlus(token_increased_value)}
					{valueLengthPreProcessing(token_increased_value)}
					{token_increased_percent &&
						'(' +
							prependPlus(token_increased_percent) +
							valueLengthPreProcessing(token_increased_percent) +
							'%)'}
				</div>
			</div>
			<div className={`${token_col}`}>
				<div className={`${token_data}`}>
					{valueLengthPreProcessing(tokens_price_today)}
				</div>
				<div
					className={`${token_data} ${
						dollar_increased_percent > 0 && 'text-green-800'
					} ${dollar_increased_percent < 0 && 'text-red-800'}`}
				>
					{prependPlus(dollar_increased_value)}
					{valueLengthPreProcessing(dollar_increased_value)}
					{dollar_increased_percent &&
						'(' +
							prependPlus(dollar_increased_percent) +
							valueLengthPreProcessing(dollar_increased_percent) +
							'%)'}
				</div>
			</div>
		</div>
	);
};

export default Token;
