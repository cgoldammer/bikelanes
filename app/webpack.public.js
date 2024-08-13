const merge = require("webpack-merge").merge;
const common = require("./webpack.common.js");
const webpack = require("webpack");

const outputFolder = "serve_content/prod";
const nodeEnv = process.env.NODE_ENV;

const outputName = "bundle_public.min.js";

const features = { RUNMODE: "public" };

const prodExports = {
  mode: "production",
  entry: "./src/indexPublic.js",
  output: { path: __dirname, filename: `${outputFolder}/${outputName}` },
  devtool: false,
  plugins: [
    new webpack.ProvidePlugin({ process: "process/browser.js" }),
    new webpack.EnvironmentPlugin(features),
  ],
};

module.exports = merge(common, prodExports);
