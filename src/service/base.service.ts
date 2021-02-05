import { Vue } from "nuxt-property-decorator";

import { IMyStore } from "~/src/store";
import { logger } from "~/src/logger";
import { IMyService } from "~/src/service/index";

let $root: Vue;
export const setBaseServiceRootComponent = (r: Vue) => {
  $root = r;
};

let $myStore: IMyStore;
export const setBaseServiceMyStore = (s: IMyStore) => {
  $myStore = s;
};

let $myService: IMyService;
export const setBaseServiceMyService = (s: IMyService) => {
  $myService = s;
};

export abstract class BaseService {
  protected get $myStore(): IMyStore {
    return $myStore;
  }

  protected get $myService(): IMyService {
    return $myService;
  }

  protected get $root(): Vue {
    return $root;
  }

  protected get $logger() {
    return logger;
  }
}
