import { Module, Mutation, VuexModule } from "vuex-module-decorators";

export type TSheetData = { [columnName: string]: any }[];

@Module({
  name: "hub",
  stateFactory: true,
  namespaced: true,
})
export default class HubStore extends VuexModule {
  mode: "data" | "code" = "data";
  showMenu: boolean = true;

  @Mutation
  SET_MODE(mode: "data" | "code"): void {
    this.mode = mode;
  }

  @Mutation
  SET_SHOW_MENU(arg: boolean): void {
    this.showMenu = arg;
  }
}
