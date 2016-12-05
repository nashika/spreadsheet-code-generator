import webpack = require("webpack");
let CopyWebpackPlugin = require("copy-webpack-plugin");
let UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

let webpackConfig:webpack.Configuration = {
  target: "atom",
  entry: {
    app: "./src/app",
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
      {test: /\.snippets/, loader: "raw", },
      {test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: "url?prefix=dist/font/&name=font/[name].[ext]&limit=10000&mimetype=application/font-woff", },
      {test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: "url?prefix=dist/font/&name=font/[name].[ext]&limit=10000&mimetype=application/font-woff", },
      {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?prefix=dist/font/&name=font/[name].[ext]&limit=10000&mimetype=application/octet-stream", },
      {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "url?prefix=dist/font/&name=font/[name].[ext]&limit=10000&mimetype=vnd.ms-fontobject"},
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?prefix=dist/font/&name=font/[name].[ext]&limit=10000&mimetype=image/svg+xml", },
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
