/** @type {import('tailwindcss').Config} */
const primeui = require('tailwindcss-primeui');
module.exports = {
	darkMode: ['selector', '[class="app-dark"]'],
	content: ['./src/**/*.{html,ts,scss,css}', './index.html'],
	plugins: [primeui],
	theme: {
		screens: {
				sm: '576px',
				md: '768px',
				lg: '992px',
				xl: '1200px',
				'2xl': '1920px'
		},
		extend: {
			colors: {
				customblue: {
					50:  '#eaf5ff',
					100: '#d4ebff',
					200: '#a9d8ff',
					300: '#7dc4ff',
					400: '#51b1ff',
					500: '#2890fc',
					600: '#2173c9',
					700: '#1a5ca0',
					800: '#144674',
					900: '#0d304a',
					950: '#081f30',
				}
			}
		}
	}
};
