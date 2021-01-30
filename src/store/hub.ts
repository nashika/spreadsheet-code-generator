import { Module, MutationAction, VuexModule } from "vuex-module-decorators";

export type TSheetData = Array<{ [columnName: string]: any }>;

@Module({
  name: "hub",
  stateFactory: true,
  namespaced: true,
})
export default class HubStore extends VuexModule {
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
