/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");
module.exports = {
  content: [    
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens:{
      'sm': '375px',
      'md': '880px',
      'lg': '1200px',
      'tall': { 'raw': '(max-height: 800px)' },
      'short':{'raw':'(max-height:500px)'}
    },
    extend: {
      backdropBlur: {
        'xs': 'blur(5px)',
      },
      colors: {
        'blue': '#1c2a46',
        'cyan':'#4ecda4',
        'rose':'#cd4e77',
        'banner-grad-top':'#FF8DB1',
        'banner-grad-bot':'#cd4e77',
        'on-white-landing':'#525252',
      },
      fontFamily:{
        'roboto':['Roboto','sans-serif'],
        'onest':['Onest','sans-serif'],
        'lora':['Lora','serif'],
        'dm':['DM Sans','sans-serif'],
        'nunito':['Nunito Sans','sans-serif']
      }
    },
  },
  plugins: [],
}