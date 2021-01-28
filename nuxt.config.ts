import { NuxtConfig } from "@nuxt/types";
import webpack from "webpack";

const webpackConfig: webpack.Configuration = {};

const config: NuxtConfig = {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,
  port: 18191,
  router: {
    mode: "hash",
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
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ["~/src/plugins/my-store"],

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
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: <any>{
    // change url to relative path
    extend(config: any, options: { isDev: boolean; isClient: boolean }) {
      if (!options.isDev) {
        config.output.publicPath = "./_nuxt/";
      }
    },
    babel: {
      compact: false,
    },
    ...webpackConfig,
  },
  telemetry: true,
};

export default config;
