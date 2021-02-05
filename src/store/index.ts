import { Store } from "vuex";
import { getModule } from "vuex-module-decorators";

import MenuStore from "~/src/store/menu";
import SheetStore from "~/src/store/sheet";

interface IMyStore {
  menu: MenuStore;
  sheet: SheetStore;
}

export const myStore: IMyStore = <any>{};

function initialiseStores(store: Store<any>): void {
  myStore.menu = getModule(MenuStore, store);
  myStore.sheet = getModule(SheetStore, store);
}

const initializer = (store: Store<any>) => initialiseStores(store);
export const plugins = [initializer];
