const tailwindcss = require('tailwindcss');

module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'media',
  theme: {

        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [tailwindcss('./tailwind.config.js'), require('autoprefixer')],
              },
            },
          },
        ],
      }
    }  
