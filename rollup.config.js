const typescript = require('@rollup/plugin-typescript');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

module.exports = {
  input: "lib/index.ts",
  output: [
    {
      file: "dist/tiptap-search-replace-plugin.cjs.js",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/tiptap-search-replace-plugin.esm.js",
      format: "es",
      sourcemap: true,
    },
  ],
  external: [
    "@tiptap/core",
    "@tiptap/pm",
    "prosemirror-state",
    "prosemirror-view",
    "prosemirror-model",
  ],
  plugins: [resolve(), commonjs(), typescript({ tsconfig: "./tsconfig.json" })],
};