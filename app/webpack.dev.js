const merge = require("webpack-merge").merge;
const webpack = require("webpack");
const common = require("./webpack.common.js");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const devServer = {
  static: "./serve_content",
  port: 8088,
  historyApiFallback: true,
  host: "0.0.0.0",
  hot: true,
  allowedHosts: "all",
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers":
      "X-Requested-With, content-type, Authorization",
  },
};

const modeVal = process.env.NODE_ENV;

const getFeatures = (modeVal) => {
  return {
    RUNMODE: modeVal,
  };
};

const devExports = (modeVal) => {
  const features = getFeatures(modeVal);

  return {
    devServer: devServer,
    mode: "development",
    devtool: "eval-source-map",
    entry: {
      app: "./src/index.js",
    },
    optimization: {
      runtimeChunk: "single",
    },
    plugins: [
      new webpack.ProvidePlugin({ process: "process/browser.js" }),
      new ReactRefreshWebpackPlugin(),
      new webpack.EnvironmentPlugin(features),
      new HtmlWebpackPlugin({
        template: "./serve_content/index_old.html",
        filename: "index.html",
        inject: "body",
      }),
    ],
  };
};

module.exports = merge(common, devExports(modeVal));
