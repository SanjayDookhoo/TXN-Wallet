import React, { useEffect, useState } from 'react';

const NavButton = ({ active, scan_button, children, ...props }) => {
	return (
		<button
			{...props}
			className={`waves-effect ${
				scan_button && !window.cordova && 'md:hidden'
			} w-16 md:w-24 h-16 md:h-24 md:text-5xl rounded-lg shadow ripple hover:shadow-lg focus:outline-none ${
				active ? 'bg-yellow-300' : ''
			} hover:bg-yellow-400 text-black`}
		>
			{children}
		</button>
	);
};

export default NavButton;
