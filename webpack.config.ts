import webpack = require("webpack");
let CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
let UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

let webpackConfig:webpack.Configuration = {
  target: "atom",
  entry: {
    app: "./lib/app",
  },
  output: {
    path: "./dist",
    publicPath: "./dist/",
    filename: "[name].bundle.js",
  },
  resolve: {
    extensions: ["", ".ts", ".js"],
  },
  module: {
    preLoaders: [
      {test: /\.jade$/, loader: "jade-html", },
    ],
    loaders: [
      {test: /\.ts$/, loader: "ts", exclude: /node_modules/, },
      {test: /\.html$/, loader: "html", },
      {test: /\.jade$/, loader: "raw", },
      {test: /\.css$/, loaders: ["style", "css"], },
      {test: /\.scss$/, loaders: ["style", "css", "sass"], },
      {test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: "url?prefix=dist/&limit=10000&mimetype=application/font-woff", },
      {test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: "url?prefix=dist/&limit=10000&mimetype=application/font-woff", },
      {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?prefix=dist/&limit=10000&mimetype=application/octet-stream", },
      {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file"},
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=image/svg+xml", },
    ],
  },
  plugins: [
  ].concat(process.env.NODE_ENV == "production" ? [new UglifyJsPlugin({
      compress: {
        warnings: false,
      },
      mangle: {
        keep_fnames: true,
      },
    }),
  ] : []),
  devtool: "source-map",
  //watch: true,
};

export = webpackConfig;
