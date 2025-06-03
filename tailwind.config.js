/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx}"], // tuỳ vào dự án bạn
    theme: {
        extend: {
            keyframes: {
                growFadeOut: {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.5)' },
                    '100%': { transform: 'scale(2)' },
                },
            },
            animation: {
                'Triet': 'growFadeOut 5s ease-out forwards',
            },
        },
    },
    plugins: [],
}
