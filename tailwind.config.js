/** @type {import('tailwindcss').Config} */

module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: '#bb2a25',
                secondary: '#017579',
                tertiary: '#CA3C25',
                dark: '#02040F',
                light: '#f8d5b4',
                accent: '#F44174',
            },
            keyframes: {
                slideright: {
                    '0%': {transform: 'translateX(-100%)'},
                    '100%': {transform: 'translateX(0%)'},
                },
                slideleft: {
                    '0%': {transform: 'translateX(100%)'},
                    '100%': {transform: 'translateX(0%)'},
                },
            },
            animation: {
                'slide-from-left': 'slideright 0.2s ease-out',
                'slide-from-right': 'slideleft 0.2s ease-out',
            },
        },
    },
    plugins: [],
};
