import { Plugin } from "@nuxt/types";

import { logger } from "~/src/logger";

const loggerPlugin: Plugin = (_context, inject) => {
  inject("logger", logger);
};
export default loggerPlugin;

declare module "vue/types/vue" {
  interface Vue {
    $logger: typeof logger;
  }
}

declare module "@nuxt/types" {
  interface NuxtAppOptions {
    $logger: typeof logger;
  }
}

declare module "vuex/types/index" {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  interface Store<S> {
    $logger: typeof logger;
  }
}
