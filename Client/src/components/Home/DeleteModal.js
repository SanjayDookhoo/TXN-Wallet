import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Button from '../Button';
import { ReactReduxContext, Provider, useSelector } from 'react-redux';
import { store } from '../../index';

const modal_id = 'delete-modal';

export const DeleteModal = () => {
	return <div id={modal_id}></div>;
};

export const createDeleteModal = ({ callback, note }) => {
	ReactDOM.render(
		<Provider context={ReactReduxContext} store={store}>
			<DeleteModalRender callback={callback} note={note} />
		</Provider>,
		document.getElementById(modal_id)
	);
};

const DeleteModalRender = ({ callback, note }) => {
	const handleCancel = () => {
		ReactDOM.unmountComponentAtNode(document.getElementById(modal_id));
	};

	const handleConfirm = () => {
		callback();
		ReactDOM.unmountComponentAtNode(document.getElementById(modal_id));
	};

	return (
		<div
			className="absolute w-screen h-screen top-0 left-0 z-10 flex justify-center items-center"
			style={{ background: '#00000066' }}
			onClick={handleCancel}
		>
			<div
				className="bg-white flex rounded-lg w-80"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex flex-col items-start w-full">
					<div className="p-4 text-red-500 font-bold">
						Are you sure you want to remove?
					</div>

					<div className="px-4 w-full">
						<div>{note}</div>
					</div>

					<div className="p-4 flex justify-between items-center w-full">
						<Button onClick={handleCancel} variant="white">
							Close
						</Button>
						<Button onClick={handleConfirm} variant="secondary">
							Confirm
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};
