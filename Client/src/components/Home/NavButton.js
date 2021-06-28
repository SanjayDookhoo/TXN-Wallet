import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

// hover effects need to be removed for cordova mobile, after clicking the hover effect remains, unless something else is explicitly clicked
// generally safe, edge case problems, remove just incase for any other buttons
const NavButton = ({ active, children, disabled, ...props }) => {
	const app = useSelector((state) => state.app);

	useEffect(() => {
		console.log({ disabled });
	}, [disabled]);

	return (
		<button
			{...props}
			className={`waves-effect w-full lg:w-24 h-16 lg:h-24 lg:text-3xl rounded-lg shadow ripple hover:shadow-lg focus:outline-none ${
				active ? 'bg-yellow-300' : ''
			} ${app.is_mobile_app ? '' : 'hover:bg-yellow-400'} ${
				disabled ? 'text-gray-400 pointer-events-none' : 'text-black'
			}`}
		>
			{children}
		</button>
	);
};

export default NavButton;
