import { NuxtConfig } from "@nuxt/types";

import { icons } from "./src/util/icons";

const config: NuxtConfig = {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,
  port: 18191,
  router: {
    mode: "hash",
    base: process.env.NODE_ENV === "production" ? "./" : undefined,
  },
  dir: {
    assets: "src/assets",
    layouts: "src/layouts",
    middleware: "src/middleware",
    pages: "src/pages",
    static: "src/static",
    store: "src/store",
  },
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: "spreadsheet-code-generator",
    htmlAttrs: {
      lang: "en",
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" },
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    script: [
      {
        innerHTML: "window.originalRequire = require;",
      },
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    "~/src/plugins/logger",
    "~/src/plugins/my-service",
    "~/src/plugins/my-store",
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: false,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    "@nuxt/typescript-build",
    // https://go.nuxtjs.dev/stylelint
    "@nuxtjs/stylelint-module",
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    "bootstrap-vue/nuxt",
    "@nuxtjs/fontawesome",
  ],
  fontawesome: {
    component: "fa",
    icons,
  },
  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    babel: {
      compact: false,
    },
    // change url to relative path
    extend(config, ctx) {
      if (!ctx.isDev) {
        if (config.output) config.output.publicPath = "_nuxt/";
      }
      config.target = "electron-renderer";
    },
  },
  telemetry: true,
};

export default config;
