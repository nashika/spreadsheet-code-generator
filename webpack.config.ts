import * as path from "path";

import * as webpack from "webpack";

let UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

let webpackConfig: webpack.Configuration = {
  target: "atom",
  entry: {
    app: "./src/app",
  },
  output: {
    path: path.join(__dirname, "dist"),
    publicPath: "/dist/",
    filename: "[name].bundle.js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    loaders: [
      {test: /\.ts$/, loader: "awesome-typescript-loader", exclude: /node_modules/},
      {test: /\.snippets/, loader: "raw-loader"},
      {
        test: /\.vue$/, loader: "Vue-loader", options:
        {
          loaders: {
            ts: "awesome-typescript-loader",
            pug: "pug-html-loader?doctype=html&pretty",
            scss: "style-loader!css-loader!sass-loader",
          },
        }
      },
    ],
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.ProgressPlugin(),
  ].concat(process.env.NODE_ENV == "production" ? [new UglifyJsPlugin({
    compress: {
      warnings: false,
    },
    mangle: {
      keep_fnames: true,
    },
    sourceMap: true,
  }),
  ] : []),
  devtool: "source-map",
  //watch: true,
};

export = webpackConfig;
