module.exports = {
	purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
	darkMode: false, // or 'media' or 'class'
	theme: {
		extend: {
			height: (theme) => ({
				'main-cont': 'calc(100% - 40px)',
			}),
			width: (theme) => ({
				'main-cont': 'calc(100% - 40px)',
			}),
		},
	},
	variants: {
		extend: {},
	},
	plugins: [],
};
