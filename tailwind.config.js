/** @type {DefaultColors} */

module.exports = {
  darkMode:'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors:{
          primary:{
            base: '#0081c8',
            light:'#5bb0fb',
            dark: '#005597'
          },
          textColor:{
            primary: '#000000',
            secondary:'#c0d0e0'
          },
        'dark-background': '#1e293b'
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
