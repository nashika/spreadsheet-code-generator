import { Vue } from "nuxt-property-decorator";
import { Plugin } from "@nuxt/types";

export const resolver: { resolve?: (root: Vue) => void } = {};
const getMyRoot = new Promise<Vue>((resolve) => {
  resolver.resolve = resolve;
});

const myStorePlugin: Plugin = async (_context, inject) => {
  inject("myStore", await getMyRoot);
};

export default myStorePlugin;

declare module "vue/types/vue" {
  interface Vue {
    $myStore: typeof myStore;
  }
}

declare module "@nuxt/types" {
  interface NuxtAppOptions {
    $myStore: typeof myStore;
  }
}

declare module "vuex/types/index" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Store<S> {
    $myStore: typeof myStore;
  }
}
