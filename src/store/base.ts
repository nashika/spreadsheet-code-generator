import { VuexModule } from "vuex-module-decorators";
import { Vue } from "nuxt-property-decorator";

let $root: Vue;
export const setBaseStoreRootComponent = (r: Vue) => {
  $root = r;
};

export class BaseStore extends VuexModule {
  get $root(): Vue {
    return $root;
  }
}
