import { Store } from "vuex";
import { getModule } from "vuex-module-decorators";

import HubModule from "~/src/store/hub";

interface IMyStore {
  hub: HubModule;
}

export const myStore: IMyStore = <any>{};

function initialiseStores(store: Store<any>): void {
  myStore.hub = getModule(HubModule, store);
}

const initializer = (store: Store<any>) => initialiseStores(store);
export const plugins = [initializer];
