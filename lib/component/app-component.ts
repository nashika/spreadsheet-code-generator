import * as path from "path";

import Component from "vue-class-component";
import electron = require('electron');

import {BaseComponent} from "./base-component";
import {FileComponent} from "./file-component";
import {SheetsComponent} from "./sheets-component";
import {ColumnComponent} from "./column-component";
import {SpreadsheetComponent} from "./spreadsheet-component";
import {SheetService} from "../service/sheet-service";
import {ColumnService} from "../service/column-service";
import {DataService} from "../service/data-service";
import {templateLoader} from "./template-loader";

export interface ISheet {
  name:string;
  columns:Array<IColumn>;
}

export interface IColumn {
  header:string;
  data:string;
  type:string;
  width:number;
}

@Component({
  template: templateLoader("app"),
  components: {
    "file-component": FileComponent,
    "sheets-component": SheetsComponent,
    "column-component": ColumnComponent,
    "spreadsheet-component": SpreadsheetComponent,
  },
  created: function () {
    this.services.sheet = new SheetService(this);
    this.services.column = new ColumnService(this);
    this.services.data = new DataService(this);
  },
})
export class AppComponent extends BaseComponent {

  saveBaseDir:string;
  sheets:{[name:string]:ISheet};
  currentSheet:ISheet;
  datas:{[name:string]:any[]};
  currentData:any[];
  services:{
    sheet: SheetService,
    column: ColumnService,
    data: DataService,
  };

  data():any {
    return {
      saveBaseDir: path.join(electron.remote.app.getAppPath(), "./sample"),
      sheets: {},
      currentSheet: null,
      datas: {},
      currentData: null,
      services: {
        sheet: null,
        column: null,
        data: null,
      },
    };
  }

}
