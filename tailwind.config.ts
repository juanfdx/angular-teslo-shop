import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['"Montserrat"', 'sans-serif'] // Use the Montserrat font downloaded from Google Fonts
      },
    }
  },
  plugins: [require("daisyui")]
}
export default config
