import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // This project uses JSX in many `.js` files (CRA-style).
  // Configure the React plugin to transform `.js` too, otherwise Vite's
  // import-analysis step will choke on JSX in `.js`.
  plugins: [
    react({
      include: ["**/*.{js,jsx,ts,tsx}"],
    }),
  ],
  esbuild: {
    loader: "jsx",
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
        ".jsx": "jsx",
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
