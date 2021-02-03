import { VuexModule } from "vuex-module-decorators";
import { Vue } from "nuxt-property-decorator";
import { Store } from "vuex";

let $root: Vue;
export const setBaseStoreRootComponent = (r: Vue) => {
  $root = r;
};

export class BaseStore extends VuexModule {
  store!: Store<any>;

  get $root(): Vue {
    return $root;
  }
}
