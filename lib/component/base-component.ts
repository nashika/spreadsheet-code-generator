import {SheetService} from "../service/sheet-service";
import {DataService} from "../service/data-service";

export interface IRootVue extends vuejs.Vue {
  services: {
    sheet:SheetService;
    data:DataService;
  };
}

export class BaseComponent {

  $root:IRootVue;
  $el:HTMLElement;

}
