import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  ssr: false,
  css: ["~/assets/css/tailwind.css", "vue-sonner/style.css"],
  compatibilityDate: "2025-01-01",
  runtimeConfig: {
    public: {
      apiBase: "https://capacity.workshape.dev",
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: "en-GB" },
      title: "Capacity",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Operations dashboard for centre, classroom, and enrolment capacity.",
        },
        { name: "theme-color", content: "#047857" },
        { name: "application-name", content: "Capacity" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Capacity" },
        {
          property: "og:description",
          content:
            "Operations dashboard for centre, classroom, and enrolment capacity.",
        },
        { property: "og:image", content: "/og.png" },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:image", content: "/og.png" },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      ],
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
