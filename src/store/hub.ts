import { Module, MutationAction } from "vuex-module-decorators";
import { BaseStore } from "~/src/store/base";

export type TSheetData = Array<{ [columnName: string]: any }>;

@Module({
  name: "hub",
  stateFactory: true,
  namespaced: true,
})
export default class HubStore extends BaseStore {
  mode: string = "data";
  showMenu: boolean = true;

  // eslint-disable-next-line require-await
  @MutationAction({
    mutate: ["showMenu"],
  })
  async initialize() {
    return {
      showMenu: true,
    };
  }
}
