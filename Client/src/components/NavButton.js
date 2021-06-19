import React, { useEffect, useState } from 'react';

const NavButton = ({ active, children, ...props }) => {
	return (
		<button
			{...props}
			className={`waves-effect w-24 h-24 rounded-lg shadow ripple hover:shadow-lg focus:outline-none ${
				active ? 'bg-yellow-300' : ''
			} hover:bg-yellow-400 text-black`}
		>
			{children}
		</button>
	);
};

export default NavButton;
