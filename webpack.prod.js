const path = require('path');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
    // plugins: [
    //     new BundleAnalyzerPlugin(),
    //     new CompressionPlugin({
    //         filename: "[path][name].gz",
    //         algorithm: "gzip",
    //         test: /vendor-mui.bundle.js/,
    //         threshold: 10240,
    //         minRatio: 0.8
    //     })
    // ],
    entry: './frontend/src/app.js',
    cache: true,
    mode: 'production',
    output: {
        path: __dirname,
        filename: './src/main/resources/static/built/[name].bundle.js'
    },
    module: {
        rules: [
            {
                test: path.join(__dirname, '.'),
                exclude: /(node_modules)/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-react"]
                    }
                }]
            }
        ]
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                reactVendor: {
                    test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
                    name: 'vendor-react',
                    chunks: 'all',
                },
                muiVendor: {
                    test: /[\\/]node_modules[\\/]@mui[\\/](material)[\\/]/,
                    name: 'vendor-mui',
                    chunks: 'all',
                },
                muiOtherVendor: {
                    test: /[\\/]node_modules[\\/]@mui[\\/](base|system|utils|x-date-pickers)[\\/]/,
                    name: 'vendor-mui-other',
                    chunks: 'all',
                },
                datefnsVendor: {
                    test: /[\\/]node_modules[\\/](date-fns)[\\/]/,
                    name: 'vendor-date-fns',
                    chunks: 'all',
                },
                restVendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor-rest',
                    chunks: 'all',
                },
            },
        },
    }
};
