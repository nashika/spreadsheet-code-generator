import { Store } from "vuex";
import { getModule } from "vuex-module-decorators";

import HubStore from "~/src/store/hub";
import ConfigStore from "~/src/store/config";
import SheetStore from "~/src/store/sheet";

interface IMyStore {
  hub: HubStore;
  config: ConfigStore;
  sheet: SheetStore;
}

export const myStore: IMyStore = <any>{};

function initialiseStores(store: Store<any>): void {
  myStore.hub = getModule(HubStore, store);
  myStore.config = getModule(ConfigStore, store);
  myStore.sheet = getModule(SheetStore, store);
}

const initializer = (store: Store<any>) => initialiseStores(store);
export const plugins = [initializer];
