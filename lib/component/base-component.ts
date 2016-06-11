import {SheetService} from "../service/sheet-service";
import {DataService} from "../service/data-service";
import {ColumnService} from "../service/column-service";
import {MenuService} from "../service/menu-service";

export interface IRootVue extends vuejs.Vue {
  services: {
    sheet:SheetService;
    column:ColumnService;
    data:DataService;
    menu:MenuService;
  };
}

export class BaseComponent {

  $root:IRootVue;
  $el:HTMLElement;

}
