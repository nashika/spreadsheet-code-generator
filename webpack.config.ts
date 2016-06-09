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
    publicPath: "/dist/",
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
