import React, { useEffect, useState } from 'react';

const NavButton = ({ children, ...props }) => {
	return (
		<button
			{...props}
			className={`w-24 h-24 m-1 rounded-lg waves-light bg-yellow-200 hover:bg-yellow-500 text-black`}
		>
			{children}
		</button>
	);
};

export default NavButton;
