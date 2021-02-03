import { Plugin } from "@nuxt/types";

import { myService } from "~/src/service";

const servicePlugin: Plugin = (_context, inject) => {
  inject("myService", myService);
};
export default servicePlugin;

declare module "vue/types/vue" {
  interface Vue {
    $myService: typeof myService;
  }
}

declare module "@nuxt/types" {
  interface NuxtAppOptions {
    $myService: typeof myService;
  }
}

declare module "vuex/types/index" {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  interface Store<S> {
    $myService: typeof myService;
  }
}
