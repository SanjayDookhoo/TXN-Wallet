import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

// hover effects need to be removed for cordova mobile, after clicking the hover effect remains, unless something else is explicitly clicked
// generally safe, edge case problems, remove just incase for any other buttons
const Button = ({ variant, children, ...props }) => {
	const app = useSelector((state) => state.app);
	const [unique_values, updateUniqueValues] = useState(``);

	useEffect(() => {
		switch (variant) {
			case `primary`:
				updateUniqueValues(
					`waves-light bg-blue-700 ${
						app.is_mobile_app ? '' : 'hover:bg-blue-800'
					} text-black`
				);
				break;
			case `secondary`:
				updateUniqueValues(
					`waves-light bg-pink-500 ${
						app.is_mobile_app ? '' : 'hover:bg-pink-600'
					} text-black`
				);
				break;
			case `success`:
				updateUniqueValues(
					`waves-light bg-green-500 ${
						app.is_mobile_app ? '' : 'hover:bg-green-600'
					} text-black`
				);
				break;
			case `danger`:
				updateUniqueValues(
					`waves-light bg-red-500 ${
						app.is_mobile_app ? '' : 'hover:bg-red-600'
					} text-black`
				);
				break;
			case `warning`:
				updateUniqueValues(
					`waves-light bg-yellow-500 ${
						app.is_mobile_app ? '' : 'hover:bg-yellow-600'
					} text-black`
				);
				break;
			case `info`:
				updateUniqueValues(
					`waves-light bg-indigo-500 ${
						app.is_mobile_app ? '' : 'hover:bg-indigo-200'
					} text-black`
				);
				break;
			case `light`:
				updateUniqueValues(
					`bg-gray-100 ${
						app.is_mobile_app ? '' : 'hover:bg-gray-300'
					} text-black`
				);
				break;
			case `dark`:
				updateUniqueValues(
					`waves-light bg-black ${
						app.is_mobile_app ? '' : 'hover:bg-gray-800'
					} text-white`
				);
				break;
			default:
				break;
		}
	}, [variant]);

	return (
		<button
			{...props}
			className={`waves-effect inline-block px-6 py-2 text-xs font-medium leading-6 text-center uppercase transition rounded-full shadow ripple ${
				app.is_mobile_app ? '' : 'hover:shadow-lg'
			} focus:outline-none my-1 ${unique_values}`}
		>
			{children}
		</button>
	);
};

export default Button;
