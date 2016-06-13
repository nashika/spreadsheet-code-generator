import Component from "vue-class-component";
import electron = require('electron');

import {MenuComponent} from "./menu-component";
import {BaseComponent} from "./base-component";
import {SheetsComponent} from "./sheets-component";
import {ColumnComponent} from "./column-component";
import {SpreadsheetComponent} from "./spreadsheet-component";
import {CodeEditorComponent} from "./code-editor-component";
import {ConfigService} from "../service/config-service";
import {SheetService} from "../service/sheet-service";
import {ColumnService} from "../service/column-service";
import {DataService} from "../service/data-service";
import {CodeService} from "../service/code-service";
import {MenuService} from "../service/menu-service";
import {GeneratorService} from "../service/generator-service";
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
  recentSaveBaseDir?:string;
}

@Component({
  template: templateLoader("app"),
  components: {
    "menu-component": MenuComponent,
    "sheets-component": SheetsComponent,
    "column-component": ColumnComponent,
    "spreadsheet-component": SpreadsheetComponent,
    "code-editor-component": CodeEditorComponent,
  },
  created: function () {
    this.services.config = new ConfigService(this);
    this.services.sheet = new SheetService(this);
    this.services.column = new ColumnService(this);
    this.services.data = new DataService(this);
    this.services.code = new CodeService(this);
    this.services.menu = new MenuService(this);
    this.services.generator = new GeneratorService(this);
  },
})
export class AppComponent extends BaseComponent {

  saveBaseDir:string;
  config:IConfig;
  mode:string;
  sheets:{[sheetName:string]:ISheet};
  sheetMetas:{[sheetName:string]:ISheetMeta};
  datas:{[sheetName:string]:any[]};
  codes:{[sheetName:string]:string};
  currentSheet:ISheet;
  currentSheetMeta:ISheetMeta;
  currentData:any[];
  currentCode:string;
  showMenu:boolean;
  services:{
    config:ConfigService;
    sheet:SheetService;
    column:ColumnService;
    data:DataService;
    code:CodeService;
    menu:MenuService;
    generator:GeneratorService;
  };

  data():any {
    return {
      saveBaseDir: "",
      config: null,
      mode: "data",
      sheets: null,
      sheetMetas: null,
      datas: null,
      codes: null,
      currentSheet: null,
      currentSheetMeta: null,
      currentData: null,
      currentCode: "",
      showMenu: true,
      services: {
        config: null,
        sheet: null,
        column: null,
        data: null,
        code: null,
        menu: null,
        generator: null,
      },
    };
  }

}
