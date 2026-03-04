/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            colors: {
                wood: {
                    50: '#faf6f1',
                    100: '#f3ebe0',
                    200: '#e8d5be',
                    300: '#d4b896',
                    400: '#c49b6f',
                    500: '#b07d4f',
                    600: '#9a6740',
                    700: '#7d5236',
                    800: '#664331',
                    900: '#54382b',
                    950: '#2e1c15',
                },
                beige: {
                    50: '#fefcf9',
                    100: '#fbf6ee',
                    200: '#f5e9d4',
                    300: '#eddbb8',
                    400: '#e0c48f',
                    500: '#d4ad6a',
                    600: '#c49952',
                    700: '#a37c3e',
                    800: '#866437',
                    900: '#6e5330',
                    950: '#3b2a18',
                },
                cream: {
                    50: '#fffdf8',
                    100: '#fff9ed',
                    200: '#fef2db',
                    300: '#fde8c3',
                    400: '#fbd798',
                    500: '#f8c46e',
                },
            },
        },
    },
    plugins: [],
}
