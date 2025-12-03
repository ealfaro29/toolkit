/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                gray: {
                    900: '#1a1a1a',
                    800: '#242424',
                    700: '#2a2a2a',
                    600: '#333333',
                }
            }
        },
    },
    plugins: [],
}
