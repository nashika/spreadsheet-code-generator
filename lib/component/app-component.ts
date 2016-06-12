import * as path from "path";

import Component from "vue-class-component";
import electron = require('electron');

import {MenuComponent} from "./menu-component";
import {BaseComponent} from "./base-component";
import {SheetsComponent} from "./sheets-component";
import {ColumnComponent} from "./column-component";
import {SpreadsheetComponent} from "./spreadsheet-component";
import {ConfigService} from "../service/config-service";
import {SheetService} from "../service/sheet-service";
import {ColumnService} from "../service/column-service";
import {DataService} from "../service/data-service";
import {MenuService} from "../service/menu-service";
import {templateLoader} from "./template-loader";

export interface ISheet {
  name:string;
  columns:Array<IColumn>;
  parent:string;
}

export interface ISheetMeta {
  modified:boolean;
}

export interface IColumn {
  header:string;
  data:string;
  type:string;
  options?:string;
  width:number;
}

export interface IConfig {
  recentSaveBaseDir?: string;
}

@Component({
  template: templateLoader("app"),
  components: {
    "menu-component": MenuComponent,
    "sheets-component": SheetsComponent,
    "column-component": ColumnComponent,
    "spreadsheet-component": SpreadsheetComponent,
  },
  created: function () {
    this.services.config = new ConfigService(this);
    this.services.sheet = new SheetService(this);
    this.services.column = new ColumnService(this);
    this.services.data = new DataService(this);
    this.services.menu = new MenuService(this);
  },
})
export class AppComponent extends BaseComponent {

  saveBaseDir:string;
  config:IConfig;
  mode:string;
  sheets:{[sheetName:string]:ISheet};
  sheetMetas:{[sheetName:string]:ISheetMeta};
  datas:{[sheetName:string]:any[]};
  currentSheet:ISheet;
  currentSheetMeta:ISheetMeta;
  currentData:any[];
  showMenu:boolean;
  services:{
    config: ConfigService,
    sheet: SheetService,
    column: ColumnService,
    data: DataService,
    menu: MenuService,
  };

  data():any {
    return {
      saveBaseDir: "",
      config: null,
      mode: "data",
      sheets: null,
      sheetMetas: null,
      datas: null,
      currentSheet: null,
      currentSheetMeta: null,
      currentData: null,
      showMenu: true,
      services: {
        config: null,
        sheet: null,
        column: null,
        data: null,
        menu: null,
      },
    };
  }

}
