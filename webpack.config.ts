import path from 'path'
import webpack, { DefinePlugin } from 'webpack'
import 'webpack-dev-server'
import { VueLoaderPlugin } from 'vue-loader'
import HTMLWebpackPlugin from 'html-webpack-plugin'

const config: webpack.Configuration = {
  mode: process.env.NODE_ENV === 'develop' ? 'development' : 'production',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          appendTsSuffixTo: [/\.vue$/]
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HTMLWebpackPlugin({
      filename: 'index.htm',
      template: 'public/index.htm'
    }),
    // Set a few Vue 3 options; see: http://link.vuejs.org/feature-flags
    new DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false // New in Vue 3.4
    })
  ],
  performance: {
    hints: false
  },
  resolve: {
    extensions: [ '.js', '.ts', 'vue' ],
    alias: {
      src: [path.resolve(__dirname, 'src')]
    }
  }
}

export default config
