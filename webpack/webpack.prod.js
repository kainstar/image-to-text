const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const config = require('./config')
const utils = require('./utils')

const env = require('./env/prod')

const webpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  module: {
    rules: utils.styleLoaders({
      extract: true,
      usePostcss: true,
      sourceMap: config.build.productionSourceMap
    })
  },
  optimization: {
    // 使用名称而不是使用id
    namedModules: true,
    namedChunks: true,
    // 运行时代码提取
    runtimeChunk: {
      name: 'manifest'
    },
    // 代码分割
    splitChunks: {
      cacheGroups: {
        vendors: {
          name: 'vendors',
          test: /node_modules/,
          chunks: 'all'
        }
      }
    }
  },
  plugins: [
    // 清理输出文件夹
    new CleanWebpackPlugin([config.base.path.dist], {
      verbose: true,
      dry: false,
      root: config.base.path.root
    }),
    new webpack.DefinePlugin({
      'process.env': env,
    }),
    // 抽取css到一个额外的文件中
    new MiniCssExtractPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css'),
      chunkFilename: utils.assetsPath('css/[id].[contenthash].css'),
    }),
    // css压缩
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        // 阻止unsafe操作（如z-index重计算）
        safe: true,
        // 删除注释
        discardComments: { removeAll: true },
        map: { inline: false }
      }
    }),
    // html文件生成
    new HtmlWebpackPlugin({
      filename: config.base.path.dist + '/index.html',
      template: config.base.path.src + '/index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
    // 复制静态资源
    new CopyWebpackPlugin([{
      from: config.base.path.static,
      to: config.build.assetsSubDirectory,
      ignore: ['.*']
    }])
  ]
})

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
