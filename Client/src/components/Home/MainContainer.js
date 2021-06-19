import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import NavButton from './NavButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { signOut } from '../../ducks/actions/auth';

const MainContainer = ({ body, navbar, ...props }) => {
	return (
		<div className="window-container flex flex-col justify-center items-center h-screen w-screen bg-yellow-500">
			{/* desktop container */}
			<div className="w-main-cont h-main-cont hidden md:block bg-gray-200 rounded-lg overflow-hidden shadow-2xl">
				<div className="w-full h-full flex flex-row justify-start">
					<div className="navbar w-24 flex flex-col justify-between items-center">
						<LogoButton />
						<div className="flex flex-col justify-between items-center">
							{navbar}
						</div>
						<LogoutButton />
					</div>
					<div className="content p-16 border-l-4 border-gray-600 flex-grow">
						{body}
					</div>
				</div>
			</div>
			{/* mobile container */}
			<div className="w-96 h-main-cont md:hidden bg-gray-200 rounded-lg overflow-hidden shadow-2xl">
				<div className="w-full h-full flex flex-col justify-start">
					<div className="navbar h-16 flex flex-row justify-between items-center">
						<LogoButton />
						<LogoutButton />
					</div>
					<div className="content p-16 border-t-4 border-b-4 border-gray-600 flex-grow">
						{body}
					</div>
					<div className="flex flex-row justify-between items-center">
						{navbar}
					</div>
				</div>
			</div>
		</div>
	);
};

export default MainContainer;

const LogoButton = () => {
	const history = useHistory();

	const handleLogoButtonClick = () => {
		if (history.location.pathname === '/active') {
			history.goBack();
		}
	};

	return (
		<button
			className="waves-effect w-16 md:w-24 h-16 md:h-24 rounded-br-lg shadow ripple hover:shadow-lg focus:outline-none bg-yellow-500"
			onClick={handleLogoButtonClick}
		>
			<img src={logo} />
		</button>
	);
};

const LogoutButton = () => {
	const dispatch = useDispatch();

	const handleSignOut = () => {
		dispatch(signOut({}));
	};

	return (
		<NavButton onClick={handleSignOut}>
			<FontAwesomeIcon icon={faSignOutAlt} />
		</NavButton>
	);
};
