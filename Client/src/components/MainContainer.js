import React, { useEffect, useState } from 'react';

const MainContainer = ({ children, ...props }) => {
	return (
		<div className="window-container h-screen w-screen flex flex-col justify-center items-center bg-yellow-500">
			<div className="w-main-cont h-main-cont flex flex-row justify-start bg-gray-200 rounded-lg overflow-hidden shadow-2xl">
				{children}
			</div>
		</div>
	);
};

export default MainContainer;
