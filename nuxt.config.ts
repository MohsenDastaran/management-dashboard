import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  ssr: false,
  css: ["~/assets/css/tailwind.css"],
  compatibilityDate: "2025-01-01",
  runtimeConfig: {
    public: {
      apiBase: "https://capacity.workshape.dev",
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  modules: ["shadcn-nuxt"],
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: "Ui",
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: "@/components/ui",
  },
});
