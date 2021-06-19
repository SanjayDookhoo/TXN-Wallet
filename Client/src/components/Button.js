import React, { useEffect, useState } from 'react';

const Button = ({ variant, children, ...props }) => {
	const [unique_values, updateUniqueValues] = useState('');

	useEffect(() => {
		switch (variant) {
			case 'primary':
				updateUniqueValues(
					'waves-light bg-blue-700 hover:bg-blue-800 text-black'
				);
				break;
			case 'secondary':
				updateUniqueValues(
					'waves-light bg-pink-500 hover:bg-pink-600 text-black'
				);
				break;
			case 'success':
				updateUniqueValues(
					'waves-light bg-green-500 hover:bg-bgreenlue-600 text-black'
				);
				break;
			case 'danger':
				updateUniqueValues(
					'waves-light bg-red-500 hover:bg-red-600 text-black'
				);
				break;
			case 'warning':
				updateUniqueValues(
					'waves-light bg-yellow-500 hover:bg-yellow-600 text-black'
				);
				break;
			case 'info':
				updateUniqueValues(
					'waves-light bg-indigo-500 hover:bg-indigo-200 text-black'
				);
				break;
			case 'light':
				updateUniqueValues('bg-gray-100 hover:bg-gray-300 text-black');
				break;
			case 'dark':
				updateUniqueValues(
					'waves-light bg-black hover:bg-gray-800 text-white'
				);
				break;
			default:
				break;
		}
	}, [variant]);

	return (
		<button
			{...props}
			className={`waves-effect inline-block px-6 py-2 text-xs font-medium leading-6 text-center uppercase transition rounded-full shadow ripple hover:shadow-lg focus:outline-none my-1 ${unique_values}`}
		>
			{children}
		</button>
	);
};

export default Button;
