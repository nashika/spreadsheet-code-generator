import { Store } from "vuex";
import { getModule } from "vuex-module-decorators";

import HubStore from "~/src/store/hub";
import MenuStore from "~/src/store/menu";
import SheetStore from "~/src/store/sheet";

interface IMyStore {
  hub: HubStore;
  menu: MenuStore;
  sheet: SheetStore;
}

export const myStore: IMyStore = <any>{};

function initialiseStores(store: Store<any>): void {
  myStore.hub = getModule(HubStore, store);
  myStore.menu = getModule(MenuStore, store);
  myStore.sheet = getModule(SheetStore, store);
}

const initializer = (store: Store<any>) => initialiseStores(store);
export const plugins = [initializer];
