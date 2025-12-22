const { defineConfig } = require("vite");
const react = require("@vitejs/plugin-react");

module.exports = defineConfig({
  plugins: [react()],
  // This codebase uses JSX in `.js` files (CRA-style). Tell Vite/esbuild to parse it.
  esbuild: {
    loader: "jsx",
    include: /src[\\/].*\.js$/,
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
});
