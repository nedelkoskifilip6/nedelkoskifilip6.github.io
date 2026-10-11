import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  site: "https://nedelkoskifilip6.github.io",
  base: "/revolut-finance",
  output: "static",
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
