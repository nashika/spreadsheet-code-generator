import * as path from "path";

import * as webpack from "webpack";

let CopyWebpackPlugin = require("copy-webpack-plugin");
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
    rules: [
      {test: /\.ts$/, loader: "awesome-typescript-loader", exclude: /node_modules/, },
      {test: /\.html$/, loaders: ["raw-loader", "jade-html-loader"]},
      {test: /\.css$/, loaders: ["style-loader", "css-loader"], },
      {test: /\.pug/, loaders: ["raw-loader", "pug-html-loader?doctype=html&pretty"]},
      {test: /\.scss$/, loaders: ["style-loader", "css-loader", "sass-loader"], },
      {test: /\.snippets/, loader: "raw-loader", },
      {test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?prefix=dist/font/&name=font/[name].[ext]&limit=10000&mimetype=application/font-woff", },
      {test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?prefix=dist/font/&name=font/[name].[ext]&limit=10000&mimetype=application/font-woff", },
      {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?prefix=dist/font/&name=font/[name].[ext]&limit=10000&mimetype=application/octet-stream", },
      {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?prefix=dist/font/&name=font/[name].[ext]&limit=10000&mimetype=vnd.ms-fontobject"},
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url-loader?prefix=dist/font/&name=font/[name].[ext]&limit=10000&mimetype=image/svg+xml", },
    ],
  },
  plugins: [
    new CopyWebpackPlugin([
      {from: "node_modules/ace-builds/src-min-noconflict/ace.js", to: "ace/ace.js"},
      {from: "node_modules/ace-builds/src-min-noconflict/mode-javascript.js", to: "ace/mode-javascript.js"},
      {from: "node_modules/ace-builds/src-min-noconflict/worker-javascript.js", to: "ace/worker-javascript.js"},
      {from: "node_modules/ace-builds/src-min-noconflict/ext-language_tools.js", to: "ace/ext-language_tools.js"},
      {from: "node_modules/ace-builds/src-min-noconflict/snippets/text.js", to: "ace/snippets/text.js"},
      {from: "node_modules/ace-builds/src-min-noconflict/snippets/javascript.js", to: "ace/snippets/javascript.js"},
      {from: "node_modules/handsontable/dist/handsontable.full.min.css", to: "handsontable/handsontable.full.min.css"},
      {from: "node_modules/handsontable/dist/handsontable.full.min.js", to: "handsontable/handsontable.full.min.js"},
    ])
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
