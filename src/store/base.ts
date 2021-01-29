import { VuexModule } from "vuex-module-decorators";
import { myStore } from "~/src/store/index";

export abstract class BaseStore extends VuexModule {
  protected $myStore = myStore;
}
