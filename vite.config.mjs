import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the output dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: "build",
    chunkSizeWarningLimit: 2000,
  },
  plugins: [tsconfigPaths(), react(), tagger()],
  server: {
    port: 3000,              // ✅ changed from 4028 to 3000
    host: "0.0.0.0",         // allows access from LAN
    strictPort: false,       // ✅ changed to false so Vite can auto-pick another port if 3000 is busy
    allowedHosts: ['.amazonaws.com', '.builtwithrocket.new']
  }
});