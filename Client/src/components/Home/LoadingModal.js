import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { ReactReduxContext, Provider, useSelector } from 'react-redux';
import { store } from '../../index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const modal_id = 'loading-modal';

export const LoadingModal = () => {
	return <div id={modal_id}></div>;
};

export const createLoadingModal = () => {
	ReactDOM.render(
		<Provider context={ReactReduxContext} store={store}>
			<LoadingModalRender />
		</Provider>,
		document.getElementById(modal_id)
	);
};

export const removeLoadingModal = () => {
	ReactDOM.unmountComponentAtNode(document.getElementById(modal_id));
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
