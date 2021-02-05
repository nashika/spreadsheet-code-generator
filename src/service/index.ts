import { MenuService } from "~/src/service/menu.service";
import { setBaseStoreMyService } from "~/src/store/base";
import { setBaseServiceMyService } from "~/src/service/base.service";

export interface IMyService {
  menu: MenuService;
}

export const myService: IMyService = {
  menu: new MenuService(),
};
setBaseStoreMyService(myService);
setBaseServiceMyService(myService);
