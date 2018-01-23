import {injectable} from "inversify";
import Vue from "vue";
import Component from "vue-class-component";

import {BaseService} from "./base.service";

export interface ISheet {
  name: string;
  columns: Array<IColumn>;
  parent: string;
  freezeColumn: number;
}

export interface ISheetMeta {
  modified: boolean;
  colOffset: number;
  rowOffset: number;
}

export type TSheetData = Array<{[columnName: string]: any}>;

export interface IColumn {
  header: string;
  data: string;
  type: "text" | "select" | "numeric";
  json?: boolean;
  options?: string[];
  width: number;
}

export interface IConfig {
  recentSaveBaseDirs?: string[];
}

@Component({})
export class HubServiceEventBus extends Vue {
  saveBaseDir: string = "";
  config: IConfig = null;
  mode: string = "data";
  sheets: {[sheetName: string]: ISheet} = null;
  sheetMetas: {[sheetName: string]: ISheetMeta} = null;
  datas: {[sheetName: string]: TSheetData} = null;
  codes: {[sheetName: string]: string} = null;
  currentSheet: ISheet = null;
  currentSheetMeta: ISheetMeta = null;
  currentData: any[] = null;
  currentCode: string = "";
  showMenu: boolean = true;
}

@injectable()
export class HubService extends BaseService {

  $vm = new HubServiceEventBus();

}
