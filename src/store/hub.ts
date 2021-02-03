import { Action, Module, Mutation } from "vuex-module-decorators";
import { BaseStore } from "~/src/store/base";

export type TSheetData = { [columnName: string]: any }[];

@Module({
  name: "hub",
  stateFactory: true,
  namespaced: true,
})
export default class HubStore extends BaseStore {
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
