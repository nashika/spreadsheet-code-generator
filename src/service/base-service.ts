import {AppComponent} from "../component/app-component";
import {IRootVue} from "../component/base-component";

export class BaseService {

  $root: IRootVue;

  constructor(protected app: AppComponent) {
    this.$root = <any>app;
  }

}
