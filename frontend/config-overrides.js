module.exports = function override(config, env) {
    // Add the ignore pattern for html5-qrcode source maps
    config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        {
            module: /node_modules\/html5-qrcode/,
        },
    ];

    config.module.rules.push({
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: [/node_modules\/html5-qrcode/]
    });

    return config;
} 