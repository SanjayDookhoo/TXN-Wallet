const path = require('path');

// craco.config.js
module.exports = {
	style: {
		postcss: {
			plugins: [require('tailwindcss'), require('autoprefixer')],
		},
	},
	eslint: {
		enable: false, // Disable ESLint that create-react-app provides
	},
};
