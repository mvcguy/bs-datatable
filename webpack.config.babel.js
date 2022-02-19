// const path = require('path');
import { resolve as _resolve } from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

var config = {
    entry: './index.ts',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bs-datatable.js',
        path: _resolve(__dirname, 'dist'),
        library: {
            name: "bs-datatable",
            type: "umd"
        }
    },
};

// import { resolve as _resolve } from 'path';
// import HtmlWebpackPlugin from 'html-webpack-plugin';

// const config = {
//   mode: 'development',
//   devServer: {
//     contentBase: './dist'
//   },
//   plugins: [
//     new HtmlWebpackPlugin({
//       filename: 'index.html',
//       template: 'src/index.html'
//     })
//   ],
//   resolve: {
//     modules: [_resolve(__dirname, './src'), 'node_modules']
//   }
// };

export default config;