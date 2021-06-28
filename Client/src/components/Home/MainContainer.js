import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import logo_mobile from '../../assets/logo_mobile.svg';
import NavButton from './NavButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { signOut } from '../../ducks/actions/auth';

const div_container =
	'h-main-cont bg-gray-200 rounded-lg overflow-hidden shadow-2xl';
const div_container_desktop = 'md:w-main-cont';
const div_container_mobile = 'w-96 ';

const inner_div_container = 'w-full h-full flex justify-start';
const inner_div_container_desktop = 'md:flex-row';
const inner_div_container_mobile = 'flex-col ';

const body_container = 'content overflow-y-auto border-gray-600 flex-grow';
const body_container_desktop =
	'md:p-16 md:border-t-0 md:border-b-0 md:border-l-4';
const body_container_mobile = 'p-2 border-t-4 border-b-4';

const MainContainer = ({ body, navbar, ...props }) => {
	return (
		<div className="window-container flex flex-col justify-center items-center h-screen w-screen bg-yellow-500">
			<div
				className={`${div_container} ${div_container_mobile} ${div_container_desktop}`}
			>
				<div
					className={`${inner_div_container} ${inner_div_container_mobile} ${inner_div_container_desktop}`}
				>
					<div className="navbar w-24 hidden md:flex flex-col justify-between items-center">
						<LogoButton />
						<div className="flex flex-col justify-between items-center">
							{navbar}
						</div>
						<LogoutButton />
					</div>
					<div className="navbar md:hidden h-12 flex flex-row justify-center items-center rounded-tr-lg rounded-tl-lg border-t-2 border-l-2 border-r-2 border-gray-600 bg-yellow-500">
						<LogoButton />
					</div>
					<div
						id="mobile-content-swipe-anchor"
						className={`${body_container} ${body_container_desktop} ${body_container_mobile}`}
					>
						{body}
					</div>
					<div className="flex md:hidden flex-row justify-between items-center">
						{navbar}
						<LogoutButton />
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
		if (history.location.pathname !== '/') {
			history.goBack();
		}
	};

	return (
		<button
			className="waves-effect w-24 md:w-24 h-10 md:h-24 md:rounded-br-lg shadow ripple hover:shadow-lg focus:outline-none bg-yellow-500"
			onClick={handleLogoButtonClick}
		>
			<img className="hidden md:block" src={logo} />
			<img className="md:hidden" src={logo_mobile} />
		</button>
	);
};

const LogoutButton = () => {
	const dispatch = useDispatch();
	const history = useHistory();

	const handleSignOut = () => {
		dispatch(signOut({ onSuccess: () => history.replace('/') }));
	};

	return (
		<NavButton onClick={handleSignOut}>
			<FontAwesomeIcon icon={faSignOutAlt} />
		</NavButton>
	);
};
