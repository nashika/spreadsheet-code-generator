import {SheetService} from "../service/sheet-service";
import {DataService} from "../service/data-service";
import {ColumnService} from "../service/column-service";

export interface IRootVue extends vuejs.Vue {
  services: {
    sheet:SheetService;
    column:ColumnService;
    data:DataService;
  };
}

export class BaseComponent {

  $root:IRootVue;
  $el:HTMLElement;

}
