import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { ReactReduxContext, Provider, useSelector } from 'react-redux';
import { store } from '../../index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';

const main_loading_modal_id = 'loading-modal';
let minimum_time = 500;
let minimum_time_up = false;

export const LoadingModal = () => {
	return <div id={main_loading_modal_id}></div>;
};

export const createLoadingModal = () => {
	// ensure no conflicts with any other loading modal
	const temp_id = uuidv4();
	const temp_div = document.createElement('div');
	temp_div.setAttribute('id', temp_id);
	document.getElementById(main_loading_modal_id).appendChild(temp_div);

	// ensures that the loading modal doesnt flicker if it loads too fast with a minimum load time
	minimum_time_up = false;
	setTimeout(() => {
		minimum_time_up = true;
	}, minimum_time);

	ReactDOM.render(
		<Provider context={ReactReduxContext} store={store}>
			<LoadingModalRender />
		</Provider>,
		temp_div
	);

	return temp_id;
};

export const removeLoadingModal = (temp_id) => {
	const unmount = () => {
		const temp_dive = document.getElementById(temp_id);
		ReactDOM.unmountComponentAtNode(temp_dive);
		temp_dive.parentNode.removeChild(temp_dive);
	};

	if (minimum_time_up) {
		unmount();
	} else {
		// if remove requested too quickly wait at least the length of time the modal supposed to remain up
		setTimeout(() => {
			unmount();
		}, minimum_time);
	}
};

const LoadingModalRender = () => {
	return (
		<div
			className="absolute w-screen h-screen top-0 left-0 flex justify-center items-center"
			style={{ background: '#00000066', zIndex: 5000 }}
		>
			<div
				className="bg-white flex justify-center items-center rounded-lg w-32 h-32"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex flex-col items-start">
					<div className="p-4 text-yellow-500 font-bold animate-spin text-6xl">
						<FontAwesomeIcon icon={faSpinner} />
					</div>
				</div>
			</div>
		</div>
	);
};
