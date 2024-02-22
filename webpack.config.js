import path from "path";
import { fileURLToPath } from "url";
import NodemonPlugin from "nodemon-webpack-plugin";
import Dotenv from "dotenv-webpack";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV == "production";

const config = {
  entry: "./index.ts",
  target: "node",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.cjs",
  },
  devServer: {
    open: true,
    host: "localhost",
  },
  plugins: [
    new NodemonPlugin(),
    new Dotenv({
      path: "./.env",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", "..."],
    fallback: {
      // Add nodejs core modules here if module not found
      fs: false,
    },
  },
  stats: {
    errorDetails: true,
  },
  // Added externals to handle warnings related to buffer utils
  externals: [{ bufferutil: "bufferutil", "utf-8-validate": "utf-8-validate" }],
};

if (isProduction) {
  config.mode = "production";
} else {
  config.mode = "development";
}

export default config;
