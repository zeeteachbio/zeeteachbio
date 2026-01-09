/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/mobile/**/*.js",
        "./src/mobile/*.js",
    ],
    corePlugins: {
        preflight: false, // Strict isolation specifically requested
    },
    theme: {
        extend: {
            colors: {
                cosmic: {
                    900: '#0f172a', // Slate 900
                    800: '#1e293b',
                    700: '#334155',
                    dark: '#020617', // Slate 950
                    accent: '#8b5cf6', // Violet 500
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            backgroundImage: {
                'cosmic-gradient': 'linear-gradient(-45deg, #0f172a, #1e1b4b, #312e81, #1e293b, #0f172a)',
            }
        },
    },
    plugins: [],
}
