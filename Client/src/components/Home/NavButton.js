import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

// hover effects need to be removed for cordova mobile, after clicking the hover effect remains, unless something else is explicitly clicked
// generally safe, edge case problems, remove just incase for any other buttons
const NavButton = ({ active, children, ...props }) => {
	const app = useSelector((state) => state.app);

	return (
		<button
			{...props}
			className={`waves-effect w-16 md:w-24 h-16 md:h-24 md:text-5xl rounded-lg shadow ripple hover:shadow-lg focus:outline-none ${
				active ? 'bg-yellow-300' : ''
			} ${app.is_mobile_app ? '' : 'hover:bg-yellow-400'} text-black`}
		>
			{children}
		</button>
	);
};

export default NavButton;
