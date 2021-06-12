const path = require('path');

// craco.config.js
module.exports = {
	style: {
		postcss: {
			plugins: [require('tailwindcss'), require('autoprefixer')],
		},
	},
	webpack: {
		alias: {
			src: path.resolve(__dirname, 'src/'),
			components: path.resolve(__dirname, 'src/components'),
			actions: path.resolve(__dirname, 'src/ducks/actions'),
		},
	},
	eslint: {
		enable: false, // Disable ESLint that create-react-app provides
	},
};
