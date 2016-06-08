import {SheetIoService} from "../service/sheet-io-service";
import {DataIoService} from "../service/data-io-service";

export interface IRootVue extends vuejs.Vue {
  services: {
    sheetIo:SheetIoService;
    dataIo:DataIoService;
  };
}

export class BaseComponent {

  $root:IRootVue;
  $el:HTMLElement;

}
