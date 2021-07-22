const path = require('path');
const outputPath = path.resolve(__dirname, "public");

module.exports = {
    mode: 'development',
    entry: './src/index.ts',
    output: {
        filename: 'bundle.js',
        path: `${outputPath}`
    },
    module: {
        rules: [{
            test: /\.ts/,
            use: 'ts-loader',
            exclude: /node_modules/,
        }, ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    }
};
