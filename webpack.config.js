const path = require('path');

module.exports =
{
  mode: 'production',
  entry: './build.js',
  module:
  {
    rules:
    [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use:
        {
          loader: 'babel-loader',
          options:
          {
            presets: [ "@babel/preset-env" ]
          }
        }
      }
    ]
  },
  resolve:
  {
    extensions: ['.js']
  },
  output:
  {
    filename: "se-tools.min.js",
    path: path.resolve(__dirname, 'dist')
  }
}