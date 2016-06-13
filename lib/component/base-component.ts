import {SheetService} from "../service/sheet-service";
import {DataService} from "../service/data-service";
import {ColumnService} from "../service/column-service";
import {MenuService} from "../service/menu-service";
import {CodeService} from "../service/code-service";

export interface IRootVue extends vuejs.Vue {
  services: {
    sheet:SheetService;
    column:ColumnService;
    data:DataService;
    code:CodeService;
    menu:MenuService;
  };
}

export class BaseComponent {

  $root:IRootVue;
  $el:HTMLElement;

}
