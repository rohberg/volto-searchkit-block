const { defineConfig } = require("cypress");

module.exports = defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
      // optionally pass in webpack config
      webpackConfig: require('./webpack.config'),
    },
  },
});
