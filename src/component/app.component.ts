import Component from "vue-class-component";

import BaseComponent from "./base-component";
import {ConfigService} from "../service/config.service";
import {SheetService} from "../service/sheet.service";
import {ColumnService} from "../service/column.service";
import {DataService} from "../service/data.service";
import {CodeService} from "../service/code.service";
import {MenuService} from "../service/menu.service";
import {GeneratorService} from "../service/generator.service";
import {container} from "../inversify.config";

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
  type: string;
  json?: boolean;
  options?: string[];
  width: number;
}

export interface IConfig {
  recentSaveBaseDirs?: string[];
}

@Component({
  components: {
    "menu-component": require("./menu.component.vue").default,
    "sheets-component": require("./sheets.component.vue").default,
    "search-component": require("./search.component.vue").default,
    "column-component": require("./column.component.vue").default,
    "spreadsheet-component": require("./spreadsheet.component.vue").default,
    "code-editor-component": require("./code-editor.component.vue").default,
  },
})
export default class AppComponent extends BaseComponent {

  configService: ConfigService = container.get(ConfigService);
  sheetService: SheetService = container.get(SheetService);
  columnService: ColumnService = container.get(ColumnService);
  dataService: DataService = container.get(DataService);
  codeService: CodeService = container.get(CodeService);
  menuService: MenuService = container.get(MenuService);
  generatorService: GeneratorService = container.get(GeneratorService);

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
