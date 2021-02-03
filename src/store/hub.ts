import { Action, Module, Mutation, VuexModule } from "vuex-module-decorators";

export type TSheetData = { [columnName: string]: any }[];

@Module({
  name: "hub",
  stateFactory: true,
  namespaced: true,
})
export default class HubStore extends VuexModule {
  showMenu: boolean = true;

  @Mutation
  m_setShowMenu(arg: boolean): void {
    this.showMenu = arg;
  }

  @Action
  a_toggleShowMenu(): void {
    this.m_setShowMenu(!this.showMenu);
  }
}
