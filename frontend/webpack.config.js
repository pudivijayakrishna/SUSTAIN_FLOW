module.exports = {
    // ... other webpack config
    module: {
        rules: [
            {
                test: /\.js$/,
                enforce: 'pre',
                use: ['source-map-loader'],
                exclude: [/node_modules\/html5-qrcode/]
            }
        ]
    },
    ignoreWarnings: [
        {
            module: /node_modules\/html5-qrcode/
        }
    ]
}; 