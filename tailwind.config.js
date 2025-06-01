/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx}"], // tuỳ vào dự án bạn
    theme: {
        extend: {
            animation: {
                'fade-in': 'fadeIn 0.2s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'scale(95%)' },
                    '100%': { opacity: '1', transform: 'scale(100%)' },
                },
            },
        },
    },
    plugins: [],
}
