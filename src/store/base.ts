import { config, VuexModule } from "vuex-module-decorators";
import { myStore } from "~/src/store/index";

config.rawError = true;

export abstract class BaseStore extends VuexModule {
  protected $myStore = myStore;
}
