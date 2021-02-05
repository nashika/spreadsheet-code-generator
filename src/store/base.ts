import { VuexModule } from "vuex-module-decorators";
import { Vue } from "nuxt-property-decorator";
import { Store } from "vuex";
import { IMyStore } from "~/src/store/index";
import { IMyService } from "~/src/service";

let $root: Vue;
export const setBaseStoreRootComponent = (r: Vue) => {
  $root = r;
};

let $myStore: IMyStore;
export const setBaseStoreMyStore = (s: IMyStore) => {
  $myStore = s;
};

let $myService: IMyService;
export const setBaseStoreMyService = (s: IMyService) => {
  $myService = s;
};

export class BaseStore extends VuexModule {
  store!: Store<any>;

  get $root(): Vue {
    return $root;
  }

  get $myStore(): IMyStore {
    return $myStore;
  }

  get $myService(): IMyService {
    return $myService;
  }
}
