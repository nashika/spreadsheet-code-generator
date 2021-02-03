import { MenuService } from "~/src/service/menu.service";

interface IMyService {
  menu: MenuService;
}

export const myService: IMyService = {
  menu: new MenuService(),
};
