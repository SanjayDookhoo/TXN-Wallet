import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { ReactReduxContext, Provider, useSelector } from 'react-redux';
import { store } from '../../index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

let minimum_time = 500;
let minimum_time_up = false;

export const LoadingModal = ({ loading_modal_id }) => {
	return <div id={`${loading_modal_id}-loading-modal`}></div>;
};

export const createLoadingModal = ({ loading_modal_id }) => {
	// ensures that the loading modal doesnt flicker if it loads too fast with a minimum load time
	minimum_time_up = false;
	setTimeout(() => {
		minimum_time_up = true;
	}, minimum_time);

	ReactDOM.render(
		<Provider context={ReactReduxContext} store={store}>
			<LoadingModalRender />
		</Provider>,
		document.getElementById(`${loading_modal_id}-loading-modal`)
	);
};

export const removeLoadingModal = ({ loading_modal_id }) => {
	if (minimum_time_up) {
		ReactDOM.unmountComponentAtNode(
			document.getElementById(`${loading_modal_id}-loading-modal`)
		);
	} else {
		// if remove requested too quickly wait at least the length of time the modal supposed to remain up
		setTimeout(() => {
			ReactDOM.unmountComponentAtNode(
				document.getElementById(`${loading_modal_id}-loading-modal`)
			);
		}, minimum_time);
	}
};

const LoadingModalRender = () => {
	return (
		<div
			className="absolute w-screen h-screen top-0 left-0 flex justify-center items-center"
			style={{ background: '#00000066' }}
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
