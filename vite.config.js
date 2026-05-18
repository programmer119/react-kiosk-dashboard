import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  base: "/react-kiosk-dashboard/",
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "react-index.html"),
      },
    },
  },
  plugins: [react()],
});
