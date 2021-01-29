import { Module, MutationAction } from "vuex-module-decorators";
import { BaseStore } from "~/src/store/base";

export interface ISheet {
  name: string;
  columns: IColumn[];
  parent: string;
  freezeColumn: number;
}

export interface ISheetMeta {
  modified: boolean;
  colOffset: number;
  rowOffset: number;
}

export type TSheetData = Array<{ [columnName: string]: any }>;

export interface IColumn {
  header: string;
  data: string;
  type: "text" | "select" | "numeric";
  json?: boolean;
  options?: string[];
  width: number;
  required: boolean;
  export: boolean;
  tsType: string;
}

@Module({
  name: "hub",
  stateFactory: true,
  namespaced: true,
})
export default class HubStore extends BaseStore {
  saveBaseDir: string = "";
  mode: string = "data";
  sheets: { [sheetName: string]: ISheet } | null = null;
  sheetMetas: { [sheetName: string]: ISheetMeta } | null = null;
  datas: { [sheetName: string]: TSheetData } | null = null;
  codes: { [sheetName: string]: string } | null = null;
  currentSheet: ISheet | null = null;
  currentSheetMeta: ISheetMeta | null = null;
  currentData: any[] | null = null;
  currentCode: string = "";
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
